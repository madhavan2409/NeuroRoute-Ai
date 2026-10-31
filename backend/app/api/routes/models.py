"""
SmartRoute AI - Model Registry API Route
Add, edit, configure pricing, view, and toggle models.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.models.database import get_db, ModelRegistry, Provider
from backend.app.schemas.schemas import ModelBase, ModelOut

router = APIRouter(prefix="/models", tags=["Model Registry"])

@router.get("", response_model=List[ModelOut])
def list_models(db: Session = Depends(get_db)):
    models = db.query(ModelRegistry).order_by(ModelRegistry.tier.asc(), ModelRegistry.priority.desc()).all()
    results = []
    for m in models:
        out = ModelOut(
            id=m.id,
            name=m.name,
            model_id=m.model_id,
            provider_id=m.provider_id,
            tier=m.tier,
            input_price_per_m=m.input_price_per_m,
            output_price_per_m=m.output_price_per_m,
            quality_score=m.quality_score,
            latency_p50=m.latency_p50,
            max_tokens=m.max_tokens,
            is_active=m.is_active,
            priority=m.priority,
            supports_tools=m.supports_tools,
            description=m.description or "",
            provider_name=m.provider.name if m.provider else ""
        )
        results.append(out)
    return results

@router.post("", response_model=ModelOut)
def create_model(data: ModelBase, db: Session = Depends(get_db)):
    existing = db.query(ModelRegistry).filter_by(model_id=data.model_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Model with this model_id already exists.")
    
    provider = db.query(Provider).filter_by(id=data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")

    m = ModelRegistry(
        name=data.name,
        model_id=data.model_id,
        provider_id=data.provider_id,
        tier=data.tier,
        input_price_per_m=data.input_price_per_m,
        output_price_per_m=data.output_price_per_m,
        quality_score=data.quality_score,
        latency_p50=data.latency_p50,
        max_tokens=data.max_tokens,
        is_active=data.is_active,
        priority=data.priority,
        supports_tools=data.supports_tools,
        description=data.description
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return ModelOut(
        id=m.id,
        name=m.name,
        model_id=m.model_id,
        provider_id=m.provider_id,
        tier=m.tier,
        input_price_per_m=m.input_price_per_m,
        output_price_per_m=m.output_price_per_m,
        quality_score=m.quality_score,
        latency_p50=m.latency_p50,
        max_tokens=m.max_tokens,
        is_active=m.is_active,
        priority=m.priority,
        supports_tools=m.supports_tools,
        description=m.description or "",
        provider_name=provider.name
    )

@router.put("/{model_id}")
def update_model(model_id: int, data: ModelBase, db: Session = Depends(get_db)):
    m = db.query(ModelRegistry).filter_by(id=model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found.")

    m.name = data.name
    m.tier = data.tier
    m.input_price_per_m = data.input_price_per_m
    m.output_price_per_m = data.output_price_per_m
    m.quality_score = data.quality_score
    m.latency_p50 = data.latency_p50
    m.is_active = data.is_active
    m.priority = data.priority
    m.description = data.description
    db.commit()
    return {"message": "Model updated successfully", "id": m.id}

@router.delete("/{model_id}")
def delete_model(model_id: int, db: Session = Depends(get_db)):
    m = db.query(ModelRegistry).filter_by(id=model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found.")
    db.delete(m)
    db.commit()
    return {"message": "Model deleted successfully"}
