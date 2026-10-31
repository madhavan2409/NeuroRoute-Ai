"""
SmartRoute AI - Analytics & CSV Export API Route
"""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from backend.app.models.database import get_db
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(
    timeframe: str = Query("7d", description="Timeframe filter: 24h, 7d, 30d, 90d"),
    db: Session = Depends(get_db)
):
    valid_timeframes = ["24h", "7d", "30d", "90d"]
    tf = timeframe if timeframe in valid_timeframes else "7d"
    return analytics_service.get_dashboard_summary(db=db, timeframe=tf)

@router.get("/export")
def export_csv(db: Session = Depends(get_db)):
    csv_data = analytics_service.export_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartroute_ai_analytics.csv"}
    )
