from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    doc_type = Column(String) # 'docx' or 'pptx'
    topic = Column(String)
    
    sections = relationship("Section", back_populates="project")

class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String)
    content = Column(Text, default="")
    order_index = Column(Integer)
    
    project = relationship("Project", back_populates="sections")
    feedback = relationship("Feedback", back_populates="section", uselist=False)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"))
    liked = Column(Boolean, default=None)
    comment = Column(Text)
    
    section = relationship("Section", back_populates="feedback")