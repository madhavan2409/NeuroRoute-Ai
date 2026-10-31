export interface DashboardKPIs {
  total_spending: number;
  total_requests: number;
  total_tokens: number;
  cost_savings: number;
  cost_savings_pct: number;
  avg_response_time_ms: number;
  successful_outcomes: number;
  success_rate_pct: number;
  avg_quality_score: number;
  active_models: number;
  cost_per_successful_outcome: number;
  cache_hit_rate: number;
  total_cache_entries: number;
}

export interface SpendingTrendPoint {
  date: string;
  spend: number;
  tokens: number;
  requests: number;
}

export interface ModelDistributionItem {
  name: string;
  count: number;
  spend: number;
}

export interface ComplexityDistribution {
  simple: number;
  medium: number;
  advanced: number;
}

export interface ProviderHealthItem {
  name: string;
  slug: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  error_rate: number;
  is_active: boolean;
}

export interface RoutingPaths {
  primary_path_percentage: number;
  fallback_path_percentage: number;
  total_routed: number;
  successful_requests: number;
  failed_requests: number;
}

export interface DashboardSummary {
  timeframe: string;
  kpis: DashboardKPIs;
  spending_trend: SpendingTrendPoint[];
  model_distribution: ModelDistributionItem[];
  complexity_distribution: ComplexityDistribution;
  provider_health: ProviderHealthItem[];
  routing_paths: RoutingPaths;
}

export interface WorkflowStage {
  stage: string;
  status: string;
  duration_ms: number;
  details: string;
}

export interface RoutingExplanation {
  selected_model: string;
  provider: string;
  tier: number;
  tier_label: string;
  reason: string;
  primary_candidate: string;
  fallback_candidate: string;
  fallback_triggered: boolean;
  policy_checks_passed: string[];
  cost_savings_pct: number;
  unrouted_baseline_cost: number;
  estimated_cost: number;
}

export interface QualityScorecard {
  correctness: number;
  relevance: number;
  completeness: number;
  clarity: number;
  overall: number;
  notes: string;
}

export interface NvidiaComplexityDimensions {
  creativity: number;
  reasoning: number;
  domain_knowledge: number;
  constraints: number;
  contextual_knowledge: number;
  few_shots: number;
}

export interface NvidiaClassification {
  model_source: string;
  task_type: string;
  complexity_score: number;
  complexity_label: 'simple' | 'medium' | 'advanced';
  dimensions: NvidiaComplexityDimensions;
}

export interface ChatResponse {
  request_id: string;
  prompt: string;
  answer: string;
  task_type: string;
  complexity: string;
  privacy: string;
  priority: string;
  confidence: number;
  selected_model: string;
  selected_provider: string;
  model_tier: number;
  cache_status: 'HIT' | 'MISS';
  cache_similarity: number | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  actual_cost: number;
  cost_savings: number;
  latency_ms: number;
  quality_score: number;
  tokens_saved?: number;
  tokens_saved_pct?: number;
  baseline_tokens?: number;
  efficiency_score?: number;
  efficiency_rating?: string;
  cost_multiplier?: number;
  quality_scorecard: QualityScorecard;
  routing_explanation: RoutingExplanation;
  workflow_stages: WorkflowStage[];
  nvidia_classification?: NvidiaClassification;
}

export interface ModelItem {
  id: number;
  name: string;
  model_id: string;
  provider_id: number;
  provider_name?: string;
  tier: number;
  input_price_per_m: number;
  output_price_per_m: number;
  quality_score: number;
  latency_p50: number;
  max_tokens: number;
  is_active: boolean;
  priority: number;
  supports_tools: boolean;
  description: string;
}

export interface ProviderItem {
  id: number;
  name: string;
  slug: string;
  api_base: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  error_rate: number;
  is_active: boolean;
}

export interface RoutingPolicyItem {
  id: number;
  name: string;
  min_quality: number;
  max_cost: number;
  max_latency_ms: number;
  preferred_provider: string;
  allowed_providers: string;
  fallback_order: string;
  is_active: boolean;
}

export interface BudgetItem {
  id: number;
  name: string;
  scope: string;
  limit_amount: number;
  current_spend: number;
  period: string;
  alert_thresholds: string;
  is_enforced: boolean;
  utilization_pct: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export interface CacheEntryItem {
  id: number;
  prompt_hash: string;
  prompt_text: string;
  response_text: string;
  task_type: string;
  complexity: string;
  privacy: string;
  model_name: string;
  hit_count: number;
  token_savings: number;
  cost_savings: number;
  created_at: string;
}

export interface SecurityEventItem {
  id: number;
  timestamp: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prompt_preview: string;
  action_taken: string;
  details: string;
}

export interface ApprovalItem {
  id: number;
  title: string;
  category: string;
  details: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewer?: string;
  created_at: string;
}

export interface WorkflowItem {
  id: number;
  request_id: string;
  prompt_preview: string;
  model_name: string;
  status: string;
  duration_ms: number;
  stages: WorkflowStage[];
  created_at: string;
}

export interface AgentItem {
  name: string;
  description: string;
  responsibilities: string[];
  status: string;
  recent_activity: string;
  last_active: string;
}

export interface AgentActivityLog {
  id: number;
  agent_name: string;
  action: string;
  details: string;
  status: string;
  timestamp: string;
}

export interface CompetitionModelResult {
  model_id: string;
  model_name: string;
  provider: string;
  response_text: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
  quality_score: number;
  winner: boolean;
}

export interface CompetitionResponse {
  prompt: string;
  results: CompetitionModelResult[];
  recommended_model: string;
  recommendation_reason: string;
}

export interface ContextOptimizeResponse {
  original_tokens: number;
  optimized_tokens: number;
  tokens_saved: number;
  savings_percentage: number;
  estimated_cost_reduction: number;
  optimized_text: string;
}
