import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def call_llm(prompt: str) -> str:
    if not api_key or "YOUR_ACTUAL" in api_key:
        return "[MOCK MODE] Missing API Key in .env file."

    try:
        # UPDATED LINE BELOW:
        model = genai.GenerativeModel('gemini-2.0-flash') 
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating content: {str(e)}"