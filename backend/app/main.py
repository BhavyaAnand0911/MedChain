from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.auth import router as auth_router
from app.routes.patients import router as patient_router
from app.routes.doctors import router as doctor_router
from app.routes.admin import router as admin_router
from app.routes import chatbot
from app.routes.ai_insights import router as ai_insights_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedChain API", version="1.0")

@app.middleware("http")
async def patient_profile_middleware(request: Request, call_next):
    response = await call_next(request)
    if response.headers.get("X-Error") == "Patient-Profile-Required":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Patient profile not found. Please complete your profile."}
        )
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Important
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(admin_router)
app.include_router(chatbot.router)
app.include_router(ai_insights_router)