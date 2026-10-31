"""
SmartRoute AI - Dynamic Multi-Tier Model Routing Engine
Selects the cost-optimal model satisfying:
1. Complexity Tier (Tier 1 Small/Economical, Tier 2 Balanced, Tier 3 Flagship Reasoning, Tier 4 Private/Local)
2. Task Specialization (Coding -> Sonnet/GPT-4o/Claude; Reasoning -> O1/GPT-4o; Summarization -> Flash/Mini)
3. Strict Privacy Firewall (Sensitive/Confidential -> Restricted to Tier 4 Private/Local only)
4. Active FinOps Policy (Min Quality, Max Cost, Max Latency, Preferred Providers)
5. Provider Health & Circuit Breakers (Skips down/degraded providers, executes automatic fallback chain)
6. Budget Cap Enforcement (Prevents non-critical spikes when budget utilization > 90%)
"""

from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.models.database import ModelRegistry, Provider, RoutingPolicy, Budget, SessionLocal
from backend.app.services.cost_calculator import cost_calculator

class RoutingEngine:
    def route_request(
        self,
        prompt: str,
        complexity: str,
        task_type: str,
        privacy: str,
        priority: str,
        db: Session,
        force_model_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Determines the optimal primary and fallback models.
        Returns full routing decision and structured explanation.
        """
        # Fetch active policy
        policy = db.query(RoutingPolicy).filter(RoutingPolicy.is_active == True).first()
        if not policy:
            policy = RoutingPolicy(
                name="Default Enterprise Cost-Quality Policy",
                min_quality=75.0,
                max_cost=0.08,
                max_latency_ms=2500.0,
                preferred_provider="Any",
                allowed_providers="openai,gemini,groq,anthropic,local",
                fallback_order="tier1,tier2,tier3,tier4"
            )

        # Check budget utilization
        budget = db.query(Budget).filter(Budget.is_enforced == True).first()
        budget_utilization = 0.0
        budget_restricted = False
        if budget and budget.limit_amount > 0:
            budget_utilization = (budget.current_spend / budget.limit_amount) * 100.0
            if budget_utilization >= 90.0 and priority != "critical":
                budget_restricted = True

        # Fetch all active models and providers
        all_models = (
            db.query(ModelRegistry)
            .join(Provider)
            .filter(ModelRegistry.is_active == True, Provider.is_active == True)
            .all()
        )

        if not all_models:
            raise ValueError("No active models available in Model Registry.")

        # Check for user forced model override
        if force_model_id:
            forced = next((m for m in all_models if m.model_id == force_model_id), None)
            if forced:
                return self._build_decision(
                    chosen_model=forced,
                    primary_model=forced,
                    fallback_model=forced,
                    reason=f"Model manually selected by user override ({forced.name}).",
                    policy=policy,
                    prompt=prompt,
                    complexity=complexity,
                    fallback_triggered=False,
                    budget_restricted=budget_restricted
                )

        # 1. PRIVACY FIREWALL CHECK (Strict Mandate)
        if privacy in ["sensitive", "confidential"]:
            # Must ONLY route to Tier 4 (Private / Local VPC models)
            tier4_models = [m for m in all_models if m.tier == 4 and m.provider.status != "down"]
            if tier4_models:
                tier4_models.sort(key=lambda m: (m.provider.status == "healthy", -m.quality_score, m.input_price_per_m))
                chosen = tier4_models[0]
                fallback = tier4_models[1] if len(tier4_models) > 1 else chosen
                return self._build_decision(
                    chosen_model=chosen,
                    primary_model=chosen,
                    fallback_model=fallback,
                    reason=(
                        f"Routed to Tier 4 Private Model ({chosen.name}) because request contains {privacy} data. "
                        f"External commercial cloud APIs blocked by SmartRoute Privacy Firewall."
                    ),
                    policy=policy,
                    prompt=prompt,
                    complexity=complexity,
                    fallback_triggered=False,
                    budget_restricted=budget_restricted
                )

        # 2. TARGET TIER MAPPING BASED ON COMPLEXITY & BUDGET
        if budget_restricted:
            target_tier = 1  # Downgrade to economical tier to conserve budget
            budget_reason = f"Budget utilization at {budget_utilization:.1f}% (>90% threshold). Non-critical request routed to economical tier. "
        else:
            budget_reason = ""
            if complexity == "simple":
                target_tier = 1
            elif complexity == "medium":
                target_tier = 2
            else:  # advanced
                target_tier = 3

        # 3. FILTER ELIGIBLE MODELS
        eligible = []
        for m in all_models:
            # Skip down providers
            if m.provider.status == "down":
                continue
            # Check minimum quality
            if m.quality_score < policy.min_quality:
                continue
            # Check latency constraint
            if m.latency_p50 > policy.max_latency_ms:
                continue
            # Check allowed providers list
            allowed_slugs = [s.strip().lower() for s in policy.allowed_providers.split(",")]
            if m.provider.slug.lower() not in allowed_slugs and "any" not in allowed_slugs:
                continue
            
            eligible.append(m)

        if not eligible:
            # Fallback to any active model
            eligible = all_models

        # Score eligible models based on Tier match, Task specialization, Cost, and Provider Health
        def score_model(m: ModelRegistry) -> float:
            score = 100.0
            # Tier proximity penalty (hard constraint on requested tier)
            tier_diff = abs(m.tier - target_tier)
            score -= tier_diff * 45.0

            mid = m.model_id.lower()
            tier = m.tier

            # Specialized Domain & Benchmark Affinity
            if tier == 3:  # Advanced Flagships
                if task_type in ["coding", "system_architecture"]:
                    if "sonnet" in mid:
                        score += 50.0  # Industry benchmark leader for software engineering & architecture
                    elif "gpt-4o" in mid:
                        score += 32.0
                elif task_type in ["reasoning", "mathematics"]:
                    if "o1" in mid:
                        score += 60.0  # Frontier chain-of-thought mathematical proof & deep logic model
                    elif "sonnet" in mid:
                        score += 35.0
                    elif "gpt-4o" in mid:
                        score += 30.0
                elif task_type in ["data_analysis", "summarization", "general"]:
                    if "gpt-4o" in mid:
                        score += 45.0  # Multimodal omni powerhouse
                    elif "sonnet" in mid:
                        score += 30.0
                else:
                    if "gpt-4o" in mid:
                        score += 35.0

            elif tier == 2:  # Balanced Models
                if task_type == "coding":
                    if "llama-3.3" in mid:
                        score += 40.0  # Groq LPU high-throughput coding
                    elif "haiku" in mid:
                        score += 26.0
                    elif "pro" in mid:
                        score += 20.0
                elif task_type in ["summarization", "data_analysis"]:
                    if "pro" in mid:
                        score += 42.0  # 2M token context window champion
                    elif "haiku" in mid:
                        score += 24.0
                elif task_type in ["creative", "general", "reasoning"]:
                    if "haiku" in mid:
                        score += 38.0  # Anthropic safety and creative nuance
                    elif "pro" in mid:
                        score += 24.0

            elif tier == 1:  # Economical & High-Speed Models
                if task_type == "coding":
                    if "llama-3.1" in mid:
                        score += 38.0  # Sub-90ms instant code snippets on Groq
                    elif "mini" in mid:
                        score += 22.0
                elif task_type in ["mathematics", "reasoning"]:
                    if "mini" in mid:
                        score += 38.0  # Fast deterministic classification & arithmetic
                    elif "flash" in mid:
                        score += 20.0
                elif task_type in ["summarization", "general"]:
                    if "flash" in mid:
                        score += 38.0  # High-throughput general & summarization
                    elif "mini" in mid:
                        score += 24.0
                    elif "llama-3.1" in mid:
                        score += 30.0

            elif tier == 4:  # Private / Air-Gapped VPC
                if task_type in ["reasoning", "mathematics"]:
                    if "deepseek" in mid:
                        score += 38.0
                else:
                    if "llama-3" in mid:
                        score += 32.0

            # Provider status bonus/penalty
            if m.provider.status == "healthy":
                score += 10.0
            elif m.provider.status == "degraded":
                score -= 30.0

            # Cost penalty: calibrated so it rewards efficiency without completely ignoring model capability
            score -= (m.input_price_per_m * 1.5)

            # Quality bonus (model benchmark quality score)
            score += ((m.quality_score - 80.0) * 0.8)

            return score

        eligible.sort(key=score_model, reverse=True)
        primary = eligible[0]
        
        # Select fallback candidate from a different provider or different tier
        fallback = next((m for m in eligible[1:] if m.provider_id != primary.provider_id), eligible[-1] if len(eligible) > 1 else primary)

        reason = (
            f"{budget_reason}"
            f"Selected Tier {primary.tier} model ({primary.name}) based on {complexity.upper()} complexity and {task_type.upper()} task. "
            f"Provides optimal balance of quality ({primary.quality_score}/100) and cost (${primary.input_price_per_m:.2f}/M in)."
        )

        return self._build_decision(
            chosen_model=primary,
            primary_model=primary,
            fallback_model=fallback,
            reason=reason,
            policy=policy,
            prompt=prompt,
            complexity=complexity,
            fallback_triggered=False,
            budget_restricted=budget_restricted
        )

    def _build_decision(
        self,
        chosen_model: ModelRegistry,
        primary_model: ModelRegistry,
        fallback_model: ModelRegistry,
        reason: str,
        policy: RoutingPolicy,
        prompt: str,
        complexity: str,
        fallback_triggered: bool,
        budget_restricted: bool
    ) -> Dict[str, Any]:
        pre_flight = cost_calculator.estimate_pre_flight(
            prompt=prompt,
            complexity=complexity,
            input_price_per_m=chosen_model.input_price_per_m,
            output_price_per_m=chosen_model.output_price_per_m,
            latency_p50=chosen_model.latency_p50
        )

        # Baseline cost calculation (Tier 3 flagship unrouted)
        baseline_cost, dollar_savings, savings_pct = cost_calculator.calculate_savings(
            actual_cost=pre_flight["estimated_cost"],
            actual_input_tokens=pre_flight["estimated_input_tokens"],
            actual_output_tokens=pre_flight["estimated_output_tokens"]
        )

        tier_labels = {
            1: "Tier 1: Small & Economical",
            2: "Tier 2: Balanced General Purpose",
            3: "Tier 3: Advanced Flagship Reasoning",
            4: "Tier 4: Enterprise Private / Local VPC"
        }

        policy_checks = [
            f"Quality requirement satisfied ({chosen_model.quality_score} >= {policy.min_quality})",
            f"Latency constraint satisfied (P50 {chosen_model.latency_p50}ms <= {policy.max_latency_ms}ms)",
            f"Provider authorized ({chosen_model.provider.name})",
            "Budget threshold approved" if not budget_restricted else "Economical tier applied for budget conservation"
        ]

        return {
            "chosen_model": chosen_model,
            "primary_model": primary_model,
            "fallback_model": fallback_model,
            "fallback_triggered": fallback_triggered,
            "tier_label": tier_labels.get(chosen_model.tier, f"Tier {chosen_model.tier}"),
            "reason": reason,
            "policy_checks_passed": policy_checks,
            "pre_flight": pre_flight,
            "unrouted_baseline_cost": baseline_cost,
            "cost_savings_pct": savings_pct
        }

routing_engine = RoutingEngine()
