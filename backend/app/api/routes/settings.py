"""
SmartRoute AI - Settings API Route
Manages application mode (Live vs Demo), API keys, and system thresholds.
"""

from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.schemas import SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings():
    return {
        "app_mode": settings.APP_MODE,
        "semantic_cache_enabled": settings.SEMANTIC_CACHE_ENABLED,
        "semantic_cache_threshold": settings.SEMANTIC_CACHE_THRESHOLD,
        "confidence_high_threshold": settings.CONFIDENCE_HIGH_THRESHOLD,
        "confidence_low_threshold": settings.CONFIDENCE_LOW_THRESHOLD,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "has_groq_key": bool(settings.GROQ_API_KEY),
        "has_anthropic_key": bool(settings.ANTHROPIC_API_KEY),
        # Mask keys for security
        "gemini_key_masked": f"{settings.GEMINI_API_KEY[:4]}...{settings.GEMINI_API_KEY[-4:]}" if len(settings.GEMINI_API_KEY) > 8 else "",
        "openai_key_masked": f"{settings.OPENAI_API_KEY[:4]}...{settings.OPENAI_API_KEY[-4:]}" if len(settings.OPENAI_API_KEY) > 8 else "",
        "groq_key_masked": f"{settings.GROQ_API_KEY[:4]}...{settings.GROQ_API_KEY[-4:]}" if len(settings.GROQ_API_KEY) > 8 else "",
        "anthropic_key_masked": f"{settings.ANTHROPIC_API_KEY[:4]}...{settings.ANTHROPIC_API_KEY[-4:]}" if len(settings.ANTHROPIC_API_KEY) > 8 else "",
    }

@router.put("")
def update_settings(data: SettingsUpdate):
    if data.app_mode is not None:
        settings.APP_MODE = data.app_mode.lower()
    if data.semantic_cache_enabled is not None:
        settings.SEMANTIC_CACHE_ENABLED = data.semantic_cache_enabled
    if data.semantic_cache_threshold is not None:
        settings.SEMANTIC_CACHE_THRESHOLD = data.semantic_cache_threshold
    if data.gemini_api_key is not None:
        settings.GEMINI_API_KEY = data.gemini_api_key
    if data.openai_api_key is not None:
        settings.OPENAI_API_KEY = data.openai_api_key
    if data.groq_api_key is not None:
        settings.GROQ_API_KEY = data.groq_api_key
    if data.anthropic_api_key is not None:
        settings.ANTHROPIC_API_KEY = data.anthropic_api_key

    return {"message": "Settings updated successfully", "app_mode": settings.APP_MODE}
