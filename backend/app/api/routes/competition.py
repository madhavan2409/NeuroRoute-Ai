"""
SmartRoute AI - Multi-Model Competition Arena API Route
Runs prompt across 2-4 selected models, comparing quality, latency, cost, and tokens.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from backend.app.models.database import get_db, ModelRegistry
from backend.app.schemas.schemas import CompetitionRequest, CompetitionResponse, CompetitionModelResult
from backend.app.providers.provider_adapter import provider_adapter
from backend.app.evaluation.evaluator import quality_evaluator
from backend.app.services.cost_calculator import cost_calculator
from backend.app.classifiers.classifier_service import classifier_service

router = APIRouter(prefix="/competition", tags=["Multi-Model Competition"])

@router.post("", response_model=CompetitionResponse)
async def run_multi_model_competition(req: CompetitionRequest, db: Session = Depends(get_db)):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    if not req.model_ids or len(req.model_ids) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 models for competition.")

    classification = classifier_service.classify(prompt)
    task_type = classification["task_type"]
    complexity = classification["complexity"]

    models = db.query(ModelRegistry).filter(ModelRegistry.model_id.in_(req.model_ids)).all()
    if not models:
        raise HTTPException(status_code=404, detail="Selected models not found.")

    async def evaluate_single_model(m: ModelRegistry) -> CompetitionModelResult:
        exec_res = await provider_adapter.execute_request(
            model_id=m.model_id,
            provider_slug=m.provider.slug,
            prompt=prompt,
            task_type=task_type,
            complexity=complexity
        )
        cost = cost_calculator.calculate_cost(
            input_tokens=exec_res["input_tokens"],
            output_tokens=exec_res["output_tokens"],
            input_price_per_m=m.input_price_per_m,
            output_price_per_m=m.output_price_per_m
        )
        quality = quality_evaluator.evaluate(
            prompt=prompt,
            response_text=exec_res["answer"],
            task_type=task_type,
            complexity=complexity
        )
        return CompetitionModelResult(
            model_id=m.model_id,
            model_name=m.name,
            provider=m.provider.name,
            response_text=exec_res["answer"],
            latency_ms=exec_res["latency_ms"],
            input_tokens=exec_res["input_tokens"],
            output_tokens=exec_res["output_tokens"],
            total_cost=cost,
            quality_score=quality["overall"],
            winner=False
        )

    results = await asyncio.gather(*[evaluate_single_model(m) for m in models])

    # Select winner based on highest Quality-per-Dollar and Latency efficiency
    # Formula: Quality Score / (Cost * 10,000 + Latency/1000)
    best_score = -1.0
    winner_idx = 0
    for idx, r in enumerate(results):
        efficiency_score = r.quality_score / max(0.0001, (r.total_cost * 2000.0) + (r.latency_ms / 1000.0))
        if efficiency_score > best_score:
            best_score = efficiency_score
            winner_idx = idx

    results[winner_idx].winner = True
    winner = results[winner_idx]

    reason = (
        f"Recommended {winner.model_name} as the FinOps winner. "
        f"Delivered a {winner.quality_score}/100 quality score in {winner.latency_ms}ms "
        f"at an operational cost of only ${winner.total_cost:.5f}."
    )

    return CompetitionResponse(
        prompt=prompt,
        results=results,
        recommended_model=winner.model_name,
        recommendation_reason=reason
    )
