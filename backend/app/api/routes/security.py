"""
SmartRoute AI - Security Center API Route
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.models.database import get_db, SecurityEvent
from backend.app.schemas.schemas import SecurityCheckRequest, SecurityCheckResponse
from backend.app.security.security_guard import security_guard

router = APIRouter(prefix="/security", tags=["Security Center"])

@router.get("/events")
def list_security_events(db: Session = Depends(get_db)):
    events = db.query(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).limit(100).all()
    return events

@router.post("/scan", response_model=SecurityCheckResponse)
def scan_prompt_security(req: SecurityCheckRequest):
    res = security_guard.inspect_prompt(req.prompt)
    return SecurityCheckResponse(
        is_safe=res["is_safe"],
        risk_level=res["risk_level"],
        flagged_reasons=res["flagged_reasons"],
        contains_pii=res["contains_pii"],
        contains_injection=res["contains_injection"],
        sanitized_prompt=res["sanitized_prompt"]
    )
