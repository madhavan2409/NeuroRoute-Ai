"""
SmartRoute AI - Workflows API Route
Inspect end-to-end execution stages, duration, and failed workflow traces.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from backend.app.models.database import get_db, Workflow, RequestRecord

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.get("")
def list_workflows(db: Session = Depends(get_db)):
    workflows = (
        db.query(Workflow)
        .join(RequestRecord)
        .order_by(Workflow.created_at.desc())
        .limit(50)
        .all()
    )
    results = []
    for w in workflows:
        try:
            stages = json.loads(w.stages_json)
        except Exception:
            stages = []
        results.append({
            "id": w.id,
            "request_id": w.request.request_id if w.request else f"req-{w.id}",
            "prompt_preview": w.request.prompt[:80] if w.request else "",
            "model_name": w.request.selected_provider if w.request else "OpenAI",
            "status": w.status,
            "duration_ms": w.duration_ms,
            "stages": stages,
            "created_at": w.created_at
        })
    return results

@router.get("/{workflow_id}")
def get_workflow_details(workflow_id: int, db: Session = Depends(get_db)):
    w = db.query(Workflow).filter_by(id=workflow_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Workflow not found.")
    return {
        "id": w.id,
        "request_id": w.request.request_id if w.request else "",
        "prompt": w.request.prompt if w.request else "",
        "response_text": w.request.response_text if w.request else "",
        "status": w.status,
        "duration_ms": w.duration_ms,
        "stages": json.loads(w.stages_json) if w.stages_json else [],
        "created_at": w.created_at
    }
