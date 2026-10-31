"""
SmartRoute AI - Pydantic Request & Response Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- Classification ---
class ClassifyRequest(BaseModel):
    prompt: str = Field(..., description="Prompt or query to analyze")

class NvidiaComplexityDimensions(BaseModel):
    creativity: float = 0.05
    reasoning: float = 0.05
    domain_knowledge: float = 0.05
    constraints: float = 0.05
    contextual_knowledge: float = 0.05
    few_shots: float = 0.0

class NvidiaClassification(BaseModel):
    model_source: str = "nvidia/prompt-task-and-complexity-classifier"
    task_type: str = "Open QA"
    complexity_score: float = 0.05
    complexity_label: str = "simple"
    dimensions: NvidiaComplexityDimensions = Field(default_factory=NvidiaComplexityDimensions)

class ClassifyResponse(BaseModel):
    complexity: str
    task_type: str
    privacy: str
    priority: str
    confidence: float
    confidence_level: str  # high, medium, low
    stage: str             # ml_classifier, rule_fallback, llm_fallback
    features: Dict[str, Any]
    sensitive_flags: List[str]
    nvidia_classification: Optional[NvidiaClassification] = None

# --- Model & Provider ---
class ProviderBase(BaseModel):
    name: str
    slug: str
    api_base: Optional[str] = ""
    status: Optional[str] = "healthy"
    latency_ms: Optional[float] = 240.0
    error_rate: Optional[float] = 0.01
    is_active: Optional[bool] = True

class ProviderOut(ProviderBase):
    id: int
    class Config:
        from_attributes = True

class ModelBase(BaseModel):
    name: str
    model_id: str
    provider_id: int
    tier: int
    input_price_per_m: float
    output_price_per_m: float
    quality_score: float = 85.0
    latency_p50: float = 350.0
    max_tokens: int = 8192
    is_active: bool = True
    priority: int = 1
    supports_tools: bool = True
    description: str = ""

class ModelOut(ModelBase):
    id: int
    provider_name: Optional[str] = ""
    class Config:
        from_attributes = True

# --- Chat & Routing ---
class ChatRequest(BaseModel):
    prompt: str
    user_id: Optional[int] = None
    workspace: Optional[str] = "Production Enterprise"
    force_model_id: Optional[str] = None
    allow_cache: Optional[bool] = True

class StageTiming(BaseModel):
    stage: str
    duration_ms: float
    status: str

class RoutingExplanation(BaseModel):
    selected_model: str
    provider: str
    tier: int
    tier_label: str
    reason: str
    primary_candidate: str
    fallback_candidate: str
    fallback_triggered: bool
    policy_checks_passed: List[str]
    cost_savings_pct: float
    unrouted_baseline_cost: float
    estimated_cost: float

class QualityScorecard(BaseModel):
    correctness: float
    relevance: float
    completeness: float
    clarity: float
    overall: float
    notes: str

class ChatResponse(BaseModel):
    request_id: str
    prompt: str
    answer: str
    task_type: str
    complexity: str
    privacy: str
    priority: str
    confidence: float
    selected_model: str
    selected_provider: str
    model_tier: int
    cache_status: str  # HIT or MISS
    cache_similarity: Optional[float] = None
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost: float
    actual_cost: float
    cost_savings: float
    latency_ms: float
    quality_score: float
    tokens_saved: int = 0
    tokens_saved_pct: float = 0.0
    baseline_tokens: int = 0
    efficiency_score: float = 0.0
    efficiency_rating: str = ""
    cost_multiplier: float = 1.0
    quality_scorecard: QualityScorecard
    routing_explanation: RoutingExplanation
    workflow_stages: List[Dict[str, Any]]
    nvidia_classification: Optional[NvidiaClassification] = None

# --- Context Optimization ---
class ContextOptimizeRequest(BaseModel):
    context: str

class ContextOptimizeResponse(BaseModel):
    original_tokens: int
    optimized_tokens: int
    tokens_saved: int
    savings_percentage: float
    estimated_cost_reduction: float
    optimized_text: str

# --- Multi-Model Competition ---
class CompetitionRequest(BaseModel):
    prompt: str
    model_ids: List[str]

class CompetitionModelResult(BaseModel):
    model_id: str
    model_name: str
    provider: str
    response_text: str
    latency_ms: float
    input_tokens: int
    output_tokens: int
    total_cost: float
    quality_score: float
    winner: bool = False

class CompetitionResponse(BaseModel):
    prompt: str
    results: List[CompetitionModelResult]
    recommended_model: str
    recommendation_reason: str

# --- Cache ---
class CacheEntryOut(BaseModel):
    id: int
    prompt_hash: str
    prompt_text: str
    response_text: str
    task_type: str
    complexity: str
    privacy: str
    model_name: str
    hit_count: int
    token_savings: int
    cost_savings: float
    created_at: Any
    class Config:
        from_attributes = True

# --- Policies & Budgets ---
class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    min_quality: Optional[float] = None
    max_cost: Optional[float] = None
    max_latency_ms: Optional[float] = None
    preferred_provider: Optional[str] = None
    allowed_providers: Optional[str] = None
    fallback_order: Optional[str] = None
    is_active: Optional[bool] = None

class BudgetCreate(BaseModel):
    name: str
    scope: str = "workspace"
    limit_amount: float
    period: str = "monthly"
    alert_thresholds: str = "50,75,90,100"
    is_enforced: bool = True

class BudgetOut(BaseModel):
    id: int
    name: str
    scope: str
    limit_amount: float
    current_spend: float
    period: str
    alert_thresholds: str
    is_enforced: bool
    utilization_pct: float
    status: str  # safe, warning, critical, exceeded
    class Config:
        from_attributes = True

# --- Approvals ---
class ApprovalOut(BaseModel):
    id: int
    title: str
    category: str
    details: str
    requested_by: str
    status: str
    created_at: Any
    class Config:
        from_attributes = True

class ApprovalDecision(BaseModel):
    action: str  # approve or reject
    reviewer: str = "Admin"
    notes: Optional[str] = ""

# --- Security ---
class SecurityCheckRequest(BaseModel):
    prompt: str

class SecurityCheckResponse(BaseModel):
    is_safe: bool
    risk_level: str
    flagged_reasons: List[str]
    contains_pii: bool
    contains_injection: bool
    sanitized_prompt: str

# --- Settings ---
class SettingsUpdate(BaseModel):
    app_mode: Optional[str] = None
    semantic_cache_enabled: Optional[bool] = None
    semantic_cache_threshold: Optional[float] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
