from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    role: str  # 'patient', 'doctor', 'admin'

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime

class PatientOut(PatientCreate):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class MedicalRecordBase(BaseModel):
    patient_name: str
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    raw_data: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordOut(MedicalRecordBase):
    id: int
    blockchain_hash: Optional[str] = None
    hash_value: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PatientDashboardOut(BaseModel):
    username: str
    full_name: Optional[str] = None
    total_records: int
    verified_records: int
    last_upload: Optional[datetime] = None
    recent_records: List[MedicalRecordOut]

class RecentActivity(BaseModel):
    type: str
    title: str
    description: str
    time: str

class PatientSummary(BaseModel):
    id: int
    name: str
    lastVisit: Optional[str]
    status: str

class DoctorDashboardResponse(BaseModel):
    message: str
    totalPatients: int
    recentConsultations: int
    pendingReviews: int
    recentActivities: List[RecentActivity]
    patients: List[PatientSummary]