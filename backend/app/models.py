from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="patient")  # 'patient', 'doctor', 'admin'
    username = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

    # If a User can have medical records directly:
    medical_records = relationship("MedicalRecord", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Other patient-specific fields
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)

    # Relationship to User
    user = relationship("User", backref="patient_profile")

    # Relationship to MedicalRecord
    medical_records = relationship("MedicalRecord", back_populates="patient")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to users
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)  # Link to patients
    patient_name = Column(String, nullable=False)
    diagnosis = Column(String, nullable=True)
    medications = Column(Text, nullable=True)
    raw_data = Column(Text, nullable=True)  # Stores extracted PDF text
    blockchain_hash = Column(String, nullable=True)
    hash_value = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    #filename = Column(String)  


    # Relationships
    user = relationship("User", back_populates="medical_records")
    patient = relationship("Patient", back_populates="medical_records")




