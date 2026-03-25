@echo off
echo Starting CrikIQ Backend...
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
