"""
SmartRoute AI - Context Optimization API Route
"""

from fastapi import APIRouter
from backend.app.schemas.schemas import ContextOptimizeRequest, ContextOptimizeResponse
from backend.app.services.context_optimizer import context_optimizer

router = APIRouter(prefix="/context", tags=["Context Optimization"])

@router.post("/optimize", response_model=ContextOptimizeResponse)
def optimize_context(req: ContextOptimizeRequest):
    res = context_optimizer.optimize(req.context)
    return ContextOptimizeResponse(
        original_tokens=res["original_tokens"],
        optimized_tokens=res["optimized_tokens"],
        tokens_saved=res["tokens_saved"],
        savings_percentage=res["savings_percentage"],
        estimated_cost_reduction=res["estimated_cost_reduction"],
        optimized_text=res["optimized_text"]
    )
