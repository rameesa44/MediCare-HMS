from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="MediLink AI Microservice", version="1.0.0")

class SymptomRequest(BaseModel):
    symptoms: List[str]

@app.get("/")
def read_root():
    return {"message": "MediLink AI Microservice is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze-symptoms")
def analyze_symptoms(request: SymptomRequest):
    # Mock AI algorithm for Sprint 0/1 testing
    symptoms_lower = [s.lower() for s in request.symptoms]
    predictions = []
    
    if "fever" in symptoms_lower and "cough" in symptoms_lower:
        predictions.append({
            "disease": "Common Cold / Influenza",
            "confidence": 0.85,
            "medicines": ["Paracetamol", "Cough Syrup"],
            "urgency": "Low"
        })
    elif "chest pain" in symptoms_lower:
        predictions.append({
            "disease": "Angina / Cardiovascular Issue",
            "confidence": 0.90,
            "medicines": ["Aspirin"],
            "urgency": "High"
        })
    else:
        predictions.append({
            "disease": "General Malaise",
            "confidence": 0.50,
            "medicines": ["Rest", "Hydration"],
            "urgency": "Low"
        })
        
    return {
        "predictions": predictions,
        "input_symptoms": request.symptoms
    }
