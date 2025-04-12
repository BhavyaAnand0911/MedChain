from fastapi import APIRouter, Depends
from ..dependencies import is_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def admin_dashboard(user=Depends(is_admin)):
    return {"message": f"Welcome, Admin {user.username}"}
