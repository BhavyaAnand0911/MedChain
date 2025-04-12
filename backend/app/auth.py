from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import logging
import requests
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Auth0 Configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    auth0_token: Optional[str] = None  # For Auth0 integration

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_management_api_token():
    try:
        response = requests.post(
            f"https://{AUTH0_DOMAIN}/oauth/token",
            json={
                "client_id": AUTH0_CLIENT_ID,
                "client_secret": AUTH0_CLIENT_SECRET,
                "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
                "grant_type": "client_credentials"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        return f"Bearer {response.json()['access_token']}"
    except Exception as e:
        logger.error(f"Auth0 token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"message": "Auth0 service unavailable"}
        )

# Endpoints
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Signup attempt for {user.email}")
        
        # Validate password
        if len(user.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Password must be at least 8 characters"}
            )

        # Check if user exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Email already registered"}
            )

        # Create local user
        hashed_password = pwd_context.hash(user.password)
        new_user = User(
            email=user.email,
            username=user.username,
            password_hash=hashed_password,
            role=user.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create Auth0 user
        auth0_response = requests.post(
            f"https://{AUTH0_DOMAIN}/dbconnections/signup",
            json={
                "client_id": AUTH0_CLIENT_ID,
                "email": user.email,
                "password": user.password,
                "connection": "Username-Password-Authentication"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        if auth0_response.status_code != 200:
            db.delete(new_user)
            db.commit()
            logger.error(f"Auth0 error: {auth0_response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Failed to create Auth0 account", "error": auth0_response.json()}
            )

        return new_user

    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"}
        )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for {credentials.email}")
        
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user or not pwd_context.verify(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid credentials"},
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Get Auth0 token if needed
        auth0_token = None
        if AUTH0_DOMAIN:
            try:
                auth0_token = get_management_api_token()
            except Exception as e:
                logger.warning(f"Could not get Auth0 token: {str(e)}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "auth0_token": auth0_token
        }
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error"}
        )

@router.get("/verify")
async def verify_token(request: Request, db: Session = Depends(get_db)):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Authorization header missing"}
            )
        
        token = auth_header.split(" ")[1]
        user = await get_current_user(token, db)
        return user
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Invalid token"}
        )

@router.post("/send-verification-email")
def send_verification_email(user_id: str):
    try:
        response = requests.post(
            f"https://{AUTH0_DOMAIN}/api/v2/jobs/verification-email",
            json={"user_id": user_id},
            headers={
                "Authorization": get_management_api_token(),
                "Content-Type": "application/json"
            },
            timeout=10
        )
        return {"message": "Verification email sent"}
    except Exception as e:
        logger.error(f"Verification email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Failed to send verification email"}
        )