from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import models, database, auth
from database import engine
from llm_service import call_llm
from routes import export
# from pydantic import BaseModel
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(export.router)

# --- Pydantic Schemas ---
class ProjectCreate(BaseModel):
    title: str
    doc_type: str
    topic: str
    outline: List[str]

class RefineRequest(BaseModel):
    instruction: str

class FeedbackRequest(BaseModel):
    liked: Optional[bool]
    comment: Optional[str]
    
class OutlineRequest(BaseModel):
    topic: str
    doc_type: str

# --- Routes ---

@app.post("/register")
def register(user: auth.UserCreate, db: Session = Depends(database.get_db)):
    return auth.create_user(db, user)

@app.post("/token")
def login(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    return auth.login_for_access_token(db, form_data)

@app.post("/projects")
def create_project(proj: ProjectCreate, db: Session = Depends(database.get_db), current_user = Depends(auth.get_current_user)):
    # 1. Create the Project Entry
    db_project = models.Project(
        title=proj.title, 
        doc_type=proj.doc_type, 
        topic=proj.topic, 
        user_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project) # Get the new ID
    
    # 2. Create the Sections
    for idx, title in enumerate(proj.outline):
        db_section = models.Section(
            project_id=db_project.id, 
            title=title, 
            order_index=idx, 
            content="Pending generation..."
        )
        db.add(db_section)
    
    db.commit() # Save all sections
    
    # --- THE CRITICAL FIX ---
    # We must refresh the project object again because the second db.commit() 
    # might have expired the instance attributes.
    db.refresh(db_project) 
    
    return db_project

@app.get("/projects")
def get_projects(db: Session = Depends(database.get_db), current_user = Depends(auth.get_current_user)):
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

@app.get("/projects/{project_id}")
def get_project_details(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    sections = db.query(models.Section).filter(models.Section.project_id == project_id).order_by(models.Section.order_index).all()
    res_sections = []
    for s in sections:
        fb = db.query(models.Feedback).filter(models.Feedback.section_id == s.id).first()
        res_sections.append({
            "id": s.id, "title": s.title, "content": s.content, 
            "feedback": {"liked": fb.liked, "comment": fb.comment} if fb else {}
        })
    return {"project": project, "sections": res_sections}

@app.post("/sections/{section_id}/generate")
def generate_section_content(section_id: int, db: Session = Depends(database.get_db)):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    project = db.query(models.Project).filter(models.Project.id == section.project_id).first()
    

    # Define instructions based on Doc Type
    if project.doc_type == 'pptx':
        style_instruction = """
        FORMAT FOR POWERPOINT SLIDE:
        - INTELLIGENTLY CHOOSE FORMAT based on the section title:
            - IF the section is 'Introduction', 'Conclusion', 'Summary', or 'History': Write 1-4 clear, concise paragraphs. Do NOT use bullet points.
            - IF the section is 'Types', 'Causes', 'Features', 'Steps', or 'Benefits': Use a bulleted list (3-5 items).
        - Use standard markdown bullet symbols (- or *) ONLY for lists.
        - Bold key terms using **bold syntax**.
        - Keep text concise and punchy.
        """
    else:
        # UPDATED: Added instruction for Nested Bullets
        style_instruction = """
        FORMAT FOR WORD DOCUMENT:
        - Write a DETAILED, COMPREHENSIVE response (approx. 300-500 words).
        - Structure the content using a mix of:
            1. Well-written paragraphs for introductions and explanations.
            2. Bulleted lists (using * or -).
            3. **Nested sub-bullets:** Indent sub-points with 2 spaces (e.g., "  - Subpoint").
        - Use **bold** for important terminology.
        - Use _underscores_ for italics.
        - Maintain a professional, academic tone.
        """

    prompt = f"""
    You are an expert technical writer drafting a section for a {project.doc_type}.
    
    Context:
    - Topic: "{project.topic}"
    - Section: "{section.title}"
    
    Task:
    Write content strictly for the section "{section.title}".
    
    {style_instruction}
    
    Strict constraints:
    - Do NOT include the section title in your output.
    - Do NOT include introductions or conclusions for the whole document.
    """
    
    content = call_llm(prompt)
    
    section.content = content
    db.commit()
    
    return {"content": content}

@app.post("/sections/{section_id}/refine")
def refine_section(section_id: int, req: RefineRequest, db: Session = Depends(database.get_db)):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    prompt = f"Original text: {section.content}\n\nInstruction: {req.instruction}\n\nRewrite the text:"
    new_content = call_llm(prompt)
    section.content = new_content
    db.commit()
    return {"content": new_content}

@app.post("/sections/{section_id}/feedback")
def submit_feedback(section_id: int, fb: FeedbackRequest, db: Session = Depends(database.get_db)):
    existing = db.query(models.Feedback).filter(models.Feedback.section_id == section_id).first()
    if existing:
        if fb.liked is not None: existing.liked = fb.liked
        if fb.comment is not None: existing.comment = fb.comment
    else:
        new_fb = models.Feedback(section_id=section_id, liked=fb.liked, comment=fb.comment)
        db.add(new_fb)
    db.commit()
    return {"status": "ok"}
# ... existing imports and code ...

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(database.get_db), current_user = Depends(auth.get_current_user)):
    # 1. Find the project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # 2. Security Check: Ensure the project belongs to the user
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")

    # 3. Delete associated Sections first (Cleaning up)
    # (SQLAlchemy usually handles this with cascades, but explicit delete is safer here)
    db.query(models.Section).filter(models.Section.project_id == project_id).delete()
    
    # 4. Delete the Project
    db.delete(project)
    db.commit()
    
    return {"status": "deleted", "id": project_id}

@app.post("/suggest_outline")
def suggest_outline(req: OutlineRequest):
    prompt = f"""
    You are an expert document planner.
    Task: Generate a structured outline for a {req.doc_type} about "{req.topic}".
    
    Rules:
    1. If it's a 'pptx', generate 5-7 slide titles.
    2. If it's a 'docx', generate 5-7 section headers.
    3. Return ONLY the titles, one per line.
    4. Do not include numbering (1. 2. etc) or bullet points.
    5. Do not include any intro text, just the raw titles.
    """
    
    content = call_llm(prompt)
    
    # Process response into a clean list
    lines = [line.strip().lstrip('-').lstrip('1.').strip() for line in content.split('\n') if line.strip()]
    return {"outline": lines}