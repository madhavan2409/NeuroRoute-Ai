"""
SmartRoute AI - Approvals Management API Route
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from backend.app.models.database import get_db, Approval
from backend.app.schemas.schemas import ApprovalOut, ApprovalDecision

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("", response_model=List[ApprovalOut])
def list_approvals(db: Session = Depends(get_db)):
    return db.query(Approval).order_by(Approval.created_at.desc()).all()

@router.post("/{approval_id}/approve")
def approve_action(approval_id: int, decision: ApprovalDecision, db: Session = Depends(get_db)):
    appr = db.query(Approval).filter_by(id=approval_id).first()
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    
    appr.status = "approved"
    appr.reviewed_at = datetime.now(timezone.utc)
    appr.reviewer = decision.reviewer
    db.commit()
    return {"message": "Action approved successfully", "id": approval_id, "status": "approved"}

@router.post("/{approval_id}/reject")
def reject_action(approval_id: int, decision: ApprovalDecision, db: Session = Depends(get_db)):
    appr = db.query(Approval).filter_by(id=approval_id).first()
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found.")
    
    appr.status = "rejected"
    appr.reviewed_at = datetime.now(timezone.utc)
    appr.reviewer = decision.reviewer
    db.commit()
    return {"message": "Action rejected", "id": approval_id, "status": "rejected"}
