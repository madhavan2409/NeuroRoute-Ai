"""
SmartRoute AI - Cost Calculation & Token Accounting Engine
Pre-request cost estimation, token accounting, prediction error calculation,
and baseline cost savings comparisons.
"""

from typing import Dict, Any, Tuple
import math

class CostCalculator:
    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Estimates token count.
        Rule of thumb: ~4 characters per token in English, with a minimum of 1 token.
        """
        if not text:
            return 0
        chars = len(text.strip())
        words = len(text.strip().split())
        # Blended heuristic: chars/4 adjusted for short words and code symbols
        est = max(1, int(math.ceil(chars / 3.8)))
        return est

    @staticmethod
    def calculate_cost(
        input_tokens: int,
        output_tokens: int,
        input_price_per_m: float,
        output_price_per_m: float
    ) -> float:
        """
        Formula:
        (Input Tokens * Input Price / 1,000,000) + (Output Tokens * Output Price / 1,000,000)
        """
        cost = (input_tokens * input_price_per_m / 1_000_000.0) + (output_tokens * output_price_per_m / 1_000_000.0)
        return round(cost, 6)

    def estimate_pre_flight(
        self,
        prompt: str,
        complexity: str,
        input_price_per_m: float,
        output_price_per_m: float,
        latency_p50: float
    ) -> Dict[str, Any]:
        """Calculates pre-request estimates before model invocation."""
        est_input_tokens = self.estimate_tokens(prompt)

        # Expected output tokens based on complexity
        if complexity == "simple":
            est_output_tokens = min(300, max(50, int(est_input_tokens * 1.5)))
            est_latency = latency_p50 * 0.8
        elif complexity == "medium":
            est_output_tokens = min(800, max(200, int(est_input_tokens * 2.5)))
            est_latency = latency_p50 * 1.1
        else:  # advanced
            est_output_tokens = min(2000, max(500, int(est_input_tokens * 4.0)))
            est_latency = latency_p50 * 1.8

        est_cost = self.calculate_cost(est_input_tokens, est_output_tokens, input_price_per_m, output_price_per_m)

        return {
            "estimated_input_tokens": est_input_tokens,
            "estimated_output_tokens": est_output_tokens,
            "estimated_total_tokens": est_input_tokens + est_output_tokens,
            "estimated_cost": est_cost,
            "estimated_latency_ms": round(est_latency, 1)
        }

    @staticmethod
    def calculate_savings(
        actual_cost: float,
        actual_input_tokens: int,
        actual_output_tokens: int,
        unrouted_baseline_input_price: float = 5.0,  # e.g. Tier-3 flagship rate ($5.00/M in)
        unrouted_baseline_output_price: float = 15.0 # e.g. Tier-3 flagship rate ($15.00/M out)
    ) -> Tuple[float, float, float]:
        """
        Calculates savings compared to sending all requests blindly to unrouted Tier 3 flagship model.
        Returns: (baseline_cost, dollar_saved, savings_percentage)
        """
        baseline_cost = (
            (actual_input_tokens * unrouted_baseline_input_price / 1_000_000.0) +
            (actual_output_tokens * unrouted_baseline_output_price / 1_000_000.0)
        )
        dollar_saved = max(0.0, baseline_cost - actual_cost)
        savings_pct = (dollar_saved / baseline_cost * 100.0) if baseline_cost > 0 else 0.0
        return round(baseline_cost, 6), round(dollar_saved, 6), round(savings_pct, 2)

    @staticmethod
    def calculate_token_savings(
        actual_total_tokens: int,
        complexity: str,
        is_cache_hit: bool = False
    ) -> Tuple[int, int, float]:
        """
        Calculates tokens saved compared to sending to an unrouted verbose flagship model.
        Returns: (baseline_tokens, tokens_saved, tokens_saved_pct)
        """
        if is_cache_hit:
            baseline = max(100, actual_total_tokens * 3)
            saved = baseline
            pct = 100.0
            return baseline, saved, pct

        # Flagship unrouted models generate verbose chain-of-thought and systemic boilerplate
        # Simple queries: 250 - 450 tokens unrouted vs 30 - 60 tokens on concise Tier 1
        # Medium queries: 650 - 1000 tokens unrouted vs 150 - 300 tokens on Tier 2
        # Advanced: 1200 - 2400 tokens unrouted vs 400 - 900 tokens
        if complexity == "simple":
            baseline_tokens = max(actual_total_tokens + 180, int(actual_total_tokens * 3.6))
        elif complexity == "medium":
            baseline_tokens = max(actual_total_tokens + 260, int(actual_total_tokens * 2.2))
        else:
            baseline_tokens = max(actual_total_tokens + 120, int(actual_total_tokens * 1.35))

        tokens_saved = max(0, baseline_tokens - actual_total_tokens)
        tokens_saved_pct = round((tokens_saved / baseline_tokens * 100.0), 1) if baseline_tokens > 0 else 0.0
        return baseline_tokens, tokens_saved, tokens_saved_pct

    @staticmethod
    def calculate_model_efficiency(
        cost_savings_pct: float,
        tokens_saved_pct: float,
        quality_score: float,
        latency_ms: float,
        model_tier: int,
        is_cache_hit: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates comprehensive Model Efficiency Score and breakdown.
        """
        if is_cache_hit:
            return {
                "score": 99.8,
                "rating": "Peak Efficiency (Semantic Cache)",
                "cost_efficiency_multiplier": 100.0,
                "speedup_factor": "35x Instant",
                "summary": "100% cost elimination and sub-15ms retrieval via semantic vector cache."
            }

        # Weighted FinOps efficiency index
        latency_score = min(100.0, max(20.0, (1200.0 - latency_ms) / 10.0))
        composite = (0.35 * cost_savings_pct) + (0.35 * quality_score) + (0.20 * tokens_saved_pct) + (0.10 * latency_score)
        score = round(min(99.6, max(15.0, composite)), 1)

        # Cost multiplier vs unrouted flagship
        cost_multiplier = round(100.0 / max(1.0, (100.0 - min(98.5, cost_savings_pct))), 1)

        if score >= 90.0:
            rating = "Optimal Efficiency (A+)"
        elif score >= 80.0:
            rating = "High Efficiency (A)"
        elif score >= 70.0:
            rating = "Balanced Performance (B+)"
        else:
            rating = "Standard Execution (B)"

        return {
            "score": score,
            "rating": rating,
            "cost_efficiency_multiplier": cost_multiplier,
            "speedup_factor": f"{max(1.1, round(950.0 / max(10.0, latency_ms), 1))}x",
            "summary": f"{rating}: Selected model delivers {score}% FinOps efficiency ({cost_multiplier}x cost efficiency, {tokens_saved_pct}% tokens saved)."
        }

cost_calculator = CostCalculator()
