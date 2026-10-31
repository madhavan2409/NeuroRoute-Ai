"""
SmartRoute AI - Classification & ML Metrics API Route
"""

from fastapi import APIRouter
from pathlib import Path
import json
from backend.app.schemas.schemas import ClassifyRequest, ClassifyResponse
from backend.app.classifiers.classifier_service import classifier_service

router = APIRouter(prefix="/classify", tags=["Classification"])

@router.post("", response_model=ClassifyResponse)
def classify_prompt(req: ClassifyRequest):
    res = classifier_service.classify(req.prompt)
    return ClassifyResponse(
        complexity=res["complexity"],
        task_type=res["task_type"],
        privacy=res["privacy"],
        priority=res["priority"],
        confidence=res["confidence"],
        confidence_level=res["confidence_level"],
        stage=res["stage"],
        features=res["features"],
        sensitive_flags=res["sensitive_flags"],
        nvidia_classification=res.get("nvidia_classification")
    )

@router.get("/metrics")
def get_ml_metrics():
    """Returns the measured accuracy, precision, recall, F1, and confusion matrices."""
    metrics_path = Path(__file__).resolve().parent.parent.parent.parent.parent / "ml" / "evaluation" / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "pending",
        "message": "Metrics not yet calculated. Run ml/training/train_classifier.py."
    }
