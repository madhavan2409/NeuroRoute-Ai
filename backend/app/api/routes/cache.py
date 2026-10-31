"""
SmartRoute AI - Semantic Cache API Route
View cached responses, delete entries, clear cache, adjust similarity threshold.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.models.database import get_db, CacheEntry
from backend.app.schemas.schemas import CacheEntryOut
from backend.app.caching.semantic_cache import semantic_cache

router = APIRouter(prefix="/cache", tags=["Semantic Cache"])

@router.get("", response_model=List[CacheEntryOut])
def list_cache_entries(db: Session = Depends(get_db)):
    return db.query(CacheEntry).order_by(CacheEntry.last_accessed.desc()).limit(100).all()

@router.delete("/{entry_id}")
def delete_cache_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(CacheEntry).filter_by(id=entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Cache entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Cache entry deleted successfully", "id": entry_id}

@router.post("/clear")
def clear_cache(db: Session = Depends(get_db)):
    count = db.query(CacheEntry).delete()
    db.commit()
    return {"message": f"Successfully purged {count} entries from semantic cache."}

@router.post("/threshold")
def set_cache_threshold(payload: dict):
    threshold = float(payload.get("threshold", 0.88))
    semantic_cache.threshold = max(0.50, min(0.99, threshold))
    return {"message": "Threshold updated", "threshold": semantic_cache.threshold}
