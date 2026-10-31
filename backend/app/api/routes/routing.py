"""
SmartRoute AI - Routing Policies & Simulator Route
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.models.database import get_db, RoutingPolicy
from backend.app.schemas.schemas import PolicyUpdate
from backend.app.classifiers.classifier_service import classifier_service
from backend.app.routing.routing_engine import routing_engine

router = APIRouter(prefix="/routing", tags=["Routing"])

@router.get("/policies")
def get_routing_policies(db: Session = Depends(get_db)):
    policy = db.query(RoutingPolicy).first()
    return policy

@router.put("/policies/{policy_id}")
def update_routing_policy(policy_id: int, data: PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(RoutingPolicy).filter_by(id=policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")

    if data.min_quality is not None:
        policy.min_quality = data.min_quality
    if data.max_cost is not None:
        policy.max_cost = data.max_cost
    if data.max_latency_ms is not None:
        policy.max_latency_ms = data.max_latency_ms
    if data.preferred_provider is not None:
        policy.preferred_provider = data.preferred_provider
    if data.allowed_providers is not None:
        policy.allowed_providers = data.allowed_providers
    if data.fallback_order is not None:
        policy.fallback_order = data.fallback_order
    if data.is_active is not None:
        policy.is_active = data.is_active

    db.commit()
    db.refresh(policy)
    return policy

@router.post("/simulate")
def simulate_route(payload: dict, db: Session = Depends(get_db)):
    prompt = payload.get("prompt", "")
    force_model_id = payload.get("force_model_id")
    classification = classifier_service.classify(prompt)
    routing_result = routing_engine.route_request(
        prompt=prompt,
        complexity=classification["complexity"],
        task_type=classification["task_type"],
        privacy=classification["privacy"],
        priority=classification["priority"],
        db=db,
        force_model_id=force_model_id
    )

    chosen = routing_result["chosen_model"]
    primary = routing_result["primary_model"]
    fallback = routing_result["fallback_model"]
    pre = routing_result["pre_flight"]

    return {
        "classification": classification,
        "selected_model": chosen.name,
        "selected_provider": chosen.provider.name,
        "tier": chosen.tier,
        "tier_label": routing_result["tier_label"],
        "reason": routing_result["reason"],
        "primary_model": primary.name,
        "fallback_model": fallback.name,
        "policy_checks_passed": routing_result["policy_checks_passed"],
        "estimated_cost": pre["estimated_cost"],
        "estimated_input_tokens": pre["estimated_input_tokens"],
        "estimated_output_tokens": pre["estimated_output_tokens"],
        "estimated_latency_ms": pre["estimated_latency_ms"],
        "unrouted_baseline_cost": routing_result["unrouted_baseline_cost"],
        "cost_savings_pct": routing_result["cost_savings_pct"]
    }
