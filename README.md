# SwiftDoc - AI-Powered Document Authoring Platform

## 📌 Overview
**SwiftDoc** is a full-stack web application designed to streamline the creation of professional business documents using Generative AI. It allows users to generate, refine, and export structured content for **Microsoft Word (.docx)** and **PowerPoint (.pptx)** formats.

By leveraging the **Google Gemini API**, SwiftDoc transforms simple topics into comprehensive outlines and detailed content, offering a "human-in-the-loop" interface for granular refinement before final export.

### Key Features
* **Dual Format Support:** Create structured Word documents (with paragraphs/lists) and PowerPoint presentations (with slide bullets).
* **AI-Driven Workflow:** Auto-generate outlines and section content based on a main topic.
* **Interactive Refinement:** Use AI to rewrite, simplify, or expand specific sections using natural language prompts.
* **Secure Authentication:** Custom JWT-based email and password login system.
* **Cloud Ready:** Configured for deployment on Render (Backend) and Vercel (Frontend).
* **Modern UI:** Sleek, monochromatic "Gotham" aesthetic using Tailwind CSS.

---

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Axios.
* **Backend:** FastAPI (Python), SQLAlchemy, Pydantic.
* **Database:** PostgreSQL (Production) / SQLite (Local Development).
* **AI Model:** Google Gemini 2.0 Flash (via `google-generativeai`).
* **File Processing:** `python-docx`, `python-pptx`.

---

## 🔑 Environment Variables

To run this project, you need to configure the following environment variables.

### Backend Variables
Create a `.env` file in the `backend/` directory:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Required.** Your Google AI Studio API Key. | `AIzaSy...` |
| `SECRET_KEY` | **Required.** A secret string for signing JWT tokens. | `mysupersecretkey123` |
| `FRONTEND_URL` | URL of the frontend (for CORS). Defaults to localhost if unset. | `deployed or local` |
| `DATABASE_URL` | (Optional) Connection string for PostgreSQL. Defaults to local SQLite. | `postgresql or sqlite local` |

### Frontend Variables
Create a `.env` file in the `frontend/` directory:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL of your running Backend API. | `http://localhost:8000` (Local) <br> `backend` (Cloud) |

---
## 📂 Project Structure

The project is organized as a monorepo containing both the **FastAPI Backend** and **React Frontend**.

```text
swiftdoc/
├── backend/                        # Python FastAPI Server
│   ├── routes/
│   │   └── export.py               # Logic for generating .docx and .pptx files
│   ├── app.py                      # Main Application Entry Point & API Routes
│   ├── auth.py                     # JWT Authentication & Password Hashing
│   ├── database.py                 # Database Connection (SQLite/PostgreSQL switcher)
│   ├── llm_service.py              # Google Gemini API Wrapper
│   ├── models.py                   # SQLAlchemy Database Models
│   ├── requirements.txt            # Python Dependencies (Cloud-ready)
│   └── .env                        # Backend Secrets (API Keys, DB URL)
│
├── frontend/                       # React (Vite) Client
│   ├── public/                     # Static Assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigPage.jsx      # Project Setup (Topic & Outline)
│   │   │   ├── Dashboard.jsx       # Project Management & Mobile Nav
│   │   │   ├── Editor.jsx          # AI Content Generation & Refinement Interface
│   │   │   └── Login.jsx           # User Authentication Form
│   │   ├── api.js                  # Axios Client with JWT Interceptor
│   │   ├── App.jsx                 # Routing & Protected Routes
│   │   ├── main.jsx                # App Entry Point
│   │   └── index.css               # Global Styles & Tailwind Directives
│   ├── .env                        # Frontend Environment Variables (API URL)
│   ├── index.html                  # HTML Template
│   ├── package.json                # Node Dependencies
│   ├── tailwind.config.js          # Tailwind CSS Configuration
│   └── vite.config.js              # Vite Configuration
│
├── .gitignore                      # Git Ignore Rules (node_modules, venv, envs)
└── README.md                       # Project Documentation
```
----
## ⚙️ Installation & Setup Steps

### Prerequisites
* **Python 3.9+**
* **Node.js 18+** & **npm**
* A valid **Google Gemini API Key**

### 1. Backend Setup (FastAPI)
The backend handles AI generation, database operations, and file exports.

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create your `.env` file (see Environment Variables section above) and add your API key.

### 2. Frontend Setup (React)
The frontend provides the responsive user interface.

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install Node dependencies:
    ```bash
    npm install
    ```
3.  Create your `.env` file and set `VITE_API_URL=http://localhost:8000`.

---

## 🚀 How to Run

### Running Locally (Development)
You need two terminal windows open.

**Terminal 1: Start Backend**
```bash
cd backend
# Ensure venv is active
uvicorn app:app --reload
```

*The API will start at `http://localhost:8000`*

**Terminal 2: Start Frontend**

```bash
cd frontend
npm run dev
```

*The UI will start at `http://localhost:5173`*

### Running in Production (Deployment)

This project is configured for cloud deployment.

  * **Backend:** Deploy the `backend/` folder to **Render** (Web Service).
      * Build Command: `pip install -r requirements.txt`
      * Start Command: `uvicorn app:app --host 0.0.0.0 --port 10000`
  * **Frontend:** Deploy the `frontend/` folder to **Vercel**.
      * Build Command: `npm run build`
      * Output Directory: `dist`

Ensure you update the `VITE_API_URL` in Vercel to point to your deployed Render backend.

-----

## 🧪 Usage Guide

1.  **Register:** Create a new account on the login page.
2.  **New Project:** Click the "+" button, select a format (DOCX/PPTX), and enter a topic.
3.  **Auto-Outline:** Use the "AI Suggest Outline" button to generate a structure automatically.
4.  **Generate & Refine:** Click "Generate" on sections. Use the Refine box to tweak content (e.g., "Make this shorter").
5.  **Export:** Click the "Export File" button to download your formatted document.

----
