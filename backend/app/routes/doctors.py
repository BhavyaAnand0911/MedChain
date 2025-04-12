from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from ..database import get_db
from ..models import User, Patient, MedicalRecord
from ..schemas import DoctorDashboardResponse, RecentActivity, PatientSummary
from ..dependencies import is_doctor

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/dashboard", response_model=DoctorDashboardResponse)
def doctor_dashboard(db: Session = Depends(get_db), user: User = Depends(is_doctor)):
    try:
        # Get total patients count
        total_patients = db.query(Patient).count()
        
        # Get recent consultations (last 7 days)
        recent_consultations = db.query(MedicalRecord).filter(
            MedicalRecord.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Get pending reviews (records without diagnosis)
        pending_reviews = db.query(MedicalRecord).filter(
            MedicalRecord.diagnosis == None
        ).count()
        
        # Get recent activities (last 5 medical records)
        recent_records = db.query(MedicalRecord).order_by(
            MedicalRecord.created_at.desc()
        ).limit(5).all()
        
        recent_activities = [
            RecentActivity(
                type="consultation",
                title=f"Consultation with {record.patient_name}",
                description=f"Diagnosis: {record.diagnosis or 'Pending'}",
                time=record.created_at.strftime("%H:%M")
            ) for record in recent_records
        ]
        
        # Get patient list summary
        patients = db.query(Patient).limit(10).all()
        patient_list = [
            PatientSummary(
                id=patient.id,
                name=f"{patient.first_name or ''} {patient.last_name or ''}".strip(),
                lastVisit=patient.user.medical_records[-1].created_at.date().isoformat() if patient.user.medical_records else None,
                status="active"  # You might want to add status logic
            ) for patient in patients
        ]
        
        return {
            "message": f"Welcome, Dr. {user.username}",
            "totalPatients": total_patients,
            "recentConsultations": recent_consultations,
            "pendingReviews": pending_reviews,
            "recentActivities": recent_activities,
            "patients": patient_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))