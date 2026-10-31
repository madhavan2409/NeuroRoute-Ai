"""
SmartRoute AI - Core Application Configuration
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartRoute AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # App Mode: 'demo' or 'live'
    APP_MODE: str = os.getenv("APP_MODE", "demo")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartroute.db")

    # AI Provider Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # Semantic Cache Settings
    SEMANTIC_CACHE_ENABLED: bool = True
    SEMANTIC_CACHE_THRESHOLD: float = 0.88  # Cosine similarity threshold

    # Classification Confidence Threshold
    CONFIDENCE_HIGH_THRESHOLD: float = 0.75
    CONFIDENCE_LOW_THRESHOLD: float = 0.50

    # Rate Limiting
    MAX_REQUESTS_PER_MINUTE: int = 60

    # Base Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
