from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..database import get_db
from ..dependencies import get_current_user, get_current_patient, is_patient
from ..models import MedicalRecord, Patient, User
from ..schemas import PatientDashboardOut, PatientCreate, MedicalRecordOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/profile/exists")
async def check_profile_exists(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if patient profile exists for the current user"""
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    return {"exists": patient is not None}

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_patient_profile(
    profile_data: PatientCreate,
    user: User = Depends(is_patient),
    db: Session = Depends(get_db)
):
    """Create a new patient profile"""
    existing_patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient profile already exists"
        )
    
    try:
        new_patient = Patient(
            user_id=user.id,
            first_name=profile_data.first_name,
            last_name=profile_data.last_name,
            date_of_birth=profile_data.date_of_birth
        )
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        return {"message": "Profile created successfully", "patient": new_patient}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating profile: {str(e)}"
        )

@router.get("/dashboard", response_model=PatientDashboardOut)
async def patient_dashboard(
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Get patient dashboard data"""
    print(f"Fetching dashboard for patient: {patient.id}")  # Debug log
    
    records = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == patient.id
    ).order_by(
        MedicalRecord.created_at.desc()
    ).all()
    
    print(f"Found {len(records)} records")  # Debug log
    
    response = {
        "username": patient.user.username,
        "first_name": patient.first_name,  # Ensure this matches your frontend expectation
        "last_name": patient.last_name,
        "total_records": len(records),
        "verified_records": sum(1 for r in records if r.blockchain_hash),
        "last_upload": records[0].created_at.isoformat() if records else None,
        "recent_records": records[:5]
    }
    
    print("Dashboard response:", response)  # Debug log
    return response