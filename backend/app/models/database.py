"""
SmartRoute AI - Database Models & Schema Definitions
Compatible with SQLite (development) and PostgreSQL (production).
"""

from datetime import datetime, timezone
import json
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Index
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy import create_engine
from backend.app.core.config import settings

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(50), default="developer")  # admin, developer, finops_analyst, viewer
    workspace = Column(String(100), default="Production Enterprise")
    budget_limit = Column(Float, default=1000.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    requests = relationship("RequestRecord", back_populates="user")

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)  # openai, gemini, groq, anthropic, local
    api_base = Column(String(255), default="")
    status = Column(String(50), default="healthy")  # healthy, degraded, down
    latency_ms = Column(Float, default=240.0)
    error_rate = Column(Float, default=0.01)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    models = relationship("ModelRegistry", back_populates="provider")

class ModelRegistry(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model_id = Column(String(100), unique=True, nullable=False, index=True)  # e.g., gpt-4o-mini, gemini-1.5-flash
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    tier = Column(Integer, default=1)  # 1: Small/Fast, 2: Medium, 3: Advanced, 4: Private/Local
    input_price_per_m = Column(Float, nullable=False)  # USD per 1M tokens
    output_price_per_m = Column(Float, nullable=False)  # USD per 1M tokens
    quality_score = Column(Float, default=85.0)  # Historical benchmark score (0-100)
    latency_p50 = Column(Float, default=350.0)  # ms
    max_tokens = Column(Integer, default=8192)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=1)  # Higher is preferred
    supports_tools = Column(Boolean, default=True)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    provider = relationship("Provider", back_populates="models")
    requests = relationship("RequestRecord", back_populates="model")

class RequestRecord(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prompt = Column(Text, nullable=False)
    response_text = Column(Text, default="")
    task_type = Column(String(50), default="general")
    complexity = Column(String(50), default="medium")
    privacy = Column(String(50), default="public")
    priority = Column(String(50), default="normal")
    confidence = Column(Float, default=0.90)

    selected_model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    selected_provider = Column(String(100), default="OpenAI")
    
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    latency_ms = Column(Float, default=0.0)
    
    success = Column(Boolean, default=True)
    quality_score = Column(Float, default=90.0)
    cache_hit = Column(Boolean, default=False)
    
    routing_reason = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="requests")
    model = relationship("ModelRegistry", back_populates="requests")
    routing_decision = relationship("RoutingDecision", back_populates="request", uselist=False)
    workflow = relationship("Workflow", back_populates="request", uselist=False)
    quality_eval = relationship("QualityEvaluation", back_populates="request", uselist=False)

class RoutingDecision(Base):
    __tablename__ = "routing_decisions"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), unique=True)
    primary_model_id = Column(String(100), default="")
    fallback_model_id = Column(String(100), default="")
    chosen_model_id = Column(String(100), default="")
    rule_applied = Column(String(200), default="Cost-Optimal Quality Tier")
    routing_reason = Column(Text, default="")
    fallback_triggered = Column(Boolean, default=False)
    cost_savings_pct = Column(Float, default=0.0)  # Savings compared to Tier 3 unrouted baseline
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    request = relationship("RequestRecord", back_populates="routing_decision")

class RoutingPolicy(Base):
    __tablename__ = "routing_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    min_quality = Column(Float, default=75.0)  # Minimum acceptable quality score
    max_cost = Column(Float, default=0.05)     # Max USD cost per request
    max_latency_ms = Column(Float, default=2000.0)
    preferred_provider = Column(String(100), default="Any")
    allowed_providers = Column(String(255), default="openai,gemini,groq,anthropic,local")
    fallback_order = Column(String(255), default="tier1,tier2,tier3,tier4")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CacheEntry(Base):
    __tablename__ = "cache_entries"

    id = Column(Integer, primary_key=True, index=True)
    prompt_hash = Column(String(64), unique=True, index=True)
    prompt_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    embedding = Column(Text, default="")  # JSON string of vector representation
    task_type = Column(String(50), default="general")
    complexity = Column(String(50), default="simple")
    privacy = Column(String(50), default="public")
    model_name = Column(String(100), default="Cached Model")
    hit_count = Column(Integer, default=0)
    token_savings = Column(Integer, default=0)
    cost_savings = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_accessed = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    scope = Column(String(50), default="workspace")  # workspace, user, team, model
    limit_amount = Column(Float, nullable=False)      # USD
    current_spend = Column(Float, default=0.0)       # USD
    period = Column(String(50), default="monthly")   # daily, weekly, monthly
    alert_thresholds = Column(String(100), default="50,75,90,100")
    is_enforced = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    event_type = Column(String(100), nullable=False)  # prompt_injection, pii_detected, rate_limit, budget_cap
    severity = Column(String(50), default="medium")   # low, medium, high, critical
    prompt_preview = Column(Text, default="")
    ip_address = Column(String(50), default="127.0.0.1")
    action_taken = Column(String(100), default="blocked")  # blocked, sanitized, routed_private, flagged
    details = Column(Text, default="")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), default="policy")  # provider, policy, budget, model, privacy
    details = Column(Text, default="")
    requested_by = Column(String(100), default="FinOps System")
    status = Column(String(50), default="pending")  # pending, approved, rejected
    reviewed_at = Column(DateTime, nullable=True)
    reviewer = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), unique=True)
    stages_json = Column(Text, default="[]")  # JSON array of stage objects
    status = Column(String(50), default="completed")  # running, completed, failed
    duration_ms = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    request = relationship("RequestRecord", back_populates="workflow")

class AgentActivity(Base):
    __tablename__ = "agent_activities"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False, index=True)  # Classification, Routing, Cost Optimization, Quality Evaluation, Security, Monitoring
    action = Column(String(200), nullable=False)
    details = Column(Text, default="")
    status = Column(String(50), default="success")  # success, warning, failure
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class QualityEvaluation(Base):
    __tablename__ = "quality_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), unique=True)
    correctness_score = Column(Float, default=90.0)
    relevance_score = Column(Float, default=92.0)
    completeness_score = Column(Float, default=88.0)
    clarity_score = Column(Float, default=95.0)
    overall_score = Column(Float, default=91.0)
    evaluation_notes = Column(Text, default="")
    evaluator_type = Column(String(50), default="rule_and_heuristic")  # rule_and_heuristic, llm_judge, human
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    request = relationship("RequestRecord", back_populates="quality_eval")

# Engine & Session Setup
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
