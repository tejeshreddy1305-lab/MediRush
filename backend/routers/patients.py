from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Patient, Emergency
from pydantic import BaseModel
import httpx, json

router = APIRouter(prefix="/api", tags=["Patients"])

class DrugRequest(BaseModel):
    drug_name: str

@router.get("/patient/{patient_id}")
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        # Return demo patient for hackathon
        return {
            "id": "demo-patient-001", "name": "Ravi Kumar",
            "age": 34, "sex": "Male", "blood_type": "O+",
            "allergies": "Penicillin",
            "chronic_conditions": "Hypertension,Type 2 Diabetes",
            "current_medications": "Amlodipine 5mg,Metformin 500mg",
            "vitals_history": json.dumps([
                {"date": "Jan 5",  "bp": "138/88", "hr": 82},
                {"date": "Jan 8",  "bp": "142/90", "hr": 79},
                {"date": "Jan 11", "bp": "135/85", "hr": 84},
                {"date": "Jan 14", "bp": "140/88", "hr": 81},
                {"date": "Jan 17", "bp": "138/86", "hr": 83},
                {"date": "Jan 20", "bp": "136/84", "hr": 80},
                {"date": "Jan 23", "bp": "133/82", "hr": 78},
            ]),
            "visit_history": json.dumps([
                {"date": "12 Jan 2025", "hospital": "Apollo Hospitals Tirupati", "diagnosis": "Hypertensive Crisis"},
                {"date": "5 Nov 2024",  "hospital": "SVIMS",                     "diagnosis": "Diabetic Review"},
            ])
        }
    return {
        "id": p.id, "name": p.name, "age": p.age, "sex": p.sex,
        "blood_type": p.blood_type, "allergies": p.allergies,
        "chronic_conditions": p.chronic_conditions,
        "current_medications": p.current_medications,
        "vitals_history": p.vitals_history,
        "visit_history": p.visit_history,
    }

@router.post("/drug_info")
async def drug_info(req: DrugRequest):
    try:
        url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22{req.drug_name}%22&limit=1"
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url)
            data = r.json()
        result = data.get("results", [{}])[0]
        return {
            "purpose": (result.get("purpose") or result.get("indications_and_usage") or [""])[0][:300],
            "warnings": (result.get("warnings") or result.get("warnings_and_cautions") or [""])[0][:300],
            "sideEffects": (result.get("adverse_reactions") or [""])[0][:300],
            "source": "U.S. FDA Drug Database (OpenFDA)"
        }
    except Exception:
        return {
            "purpose": f"{req.drug_name.capitalize()} is used to manage chronic conditions. Consult your doctor.",
            "warnings": "Do not stop taking without consulting your doctor.",
            "sideEffects": "May cause dizziness or nausea in some patients.",
            "source": "Fallback data — FDA API unavailable"
        }

@router.post("/generate_token")
def generate_token():
    import uuid
    from datetime import datetime, timedelta
    token = str(uuid.uuid4())[:8].upper()
    expires_at = (datetime.utcnow() + timedelta(minutes=20)).isoformat()
    return {"token": token, "expires_at": expires_at}