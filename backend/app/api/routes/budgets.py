"""
SmartRoute AI - Budget Management API Route
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.models.database import get_db, Budget
from backend.app.schemas.schemas import BudgetCreate, BudgetOut

router = APIRouter(prefix="/budgets", tags=["Budget Management"])

@router.get("", response_model=List[BudgetOut])
def list_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).all()
    out = []
    for b in budgets:
        util = (b.current_spend / b.limit_amount * 100.0) if b.limit_amount > 0 else 0.0
        if util >= 100.0:
            status = "exceeded"
        elif util >= 90.0:
            status = "critical"
        elif util >= 75.0:
            status = "warning"
        else:
            status = "safe"

        out.append(BudgetOut(
            id=b.id,
            name=b.name,
            scope=b.scope,
            limit_amount=b.limit_amount,
            current_spend=round(b.current_spend, 2),
            period=b.period,
            alert_thresholds=b.alert_thresholds,
            is_enforced=b.is_enforced,
            utilization_pct=round(util, 1),
            status=status
        ))
    return out

@router.post("", response_model=BudgetOut)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    b = Budget(
        name=data.name,
        scope=data.scope,
        limit_amount=data.limit_amount,
        period=data.period,
        alert_thresholds=data.alert_thresholds,
        is_enforced=data.is_enforced,
        current_spend=0.0
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BudgetOut(
        id=b.id,
        name=b.name,
        scope=b.scope,
        limit_amount=b.limit_amount,
        current_spend=0.0,
        period=b.period,
        alert_thresholds=b.alert_thresholds,
        is_enforced=b.is_enforced,
        utilization_pct=0.0,
        status="safe"
    )

@router.put("/{budget_id}")
def update_budget(budget_id: int, payload: dict, db: Session = Depends(get_db)):
    b = db.query(Budget).filter_by(id=budget_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found.")
    if "limit_amount" in payload:
        b.limit_amount = float(payload["limit_amount"])
    if "is_enforced" in payload:
        b.is_enforced = bool(payload["is_enforced"])
    db.commit()
    return {"message": "Budget updated successfully", "id": b.id}
