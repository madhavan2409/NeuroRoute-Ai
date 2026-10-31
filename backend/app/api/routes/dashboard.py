"""
SmartRoute AI - Dashboard Summary API Route
Returns 8 core KPIs, spending trends, model & complexity distributions, system health, and routing percentages.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.models.database import get_db
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    timeframe: str = Query("7d", description="Timeframe filter: 24h, 7d, 30d, 90d"),
    db: Session = Depends(get_db)
):
    valid_timeframes = ["24h", "7d", "30d", "90d"]
    tf = timeframe if timeframe in valid_timeframes else "7d"
    return analytics_service.get_dashboard_summary(db=db, timeframe=tf)
