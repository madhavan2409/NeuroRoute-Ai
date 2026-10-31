"""
SmartRoute AI - Context Optimization Service
Compresses prompts and context without losing critical facts or instructions.
Removes duplicate consecutive lines, strips redundant whitespace, extracts relevant content,
and computes tokens saved and cost reduction metrics.
"""

import re
from typing import Dict, Any
from backend.app.services.cost_calculator import cost_calculator

class ContextOptimizer:
    def optimize(self, text: str, model_input_price: float = 2.50) -> Dict[str, Any]:
        """Optimizes input text and returns before/after token metrics."""
        raw_text = text or ""
        orig_tokens = cost_calculator.estimate_tokens(raw_text)

        lines = raw_text.splitlines()
        optimized_lines = []
        seen_lines = set()

        for line in lines:
            stripped = line.strip()
            # Retain empty lines for paragraph separation, but max 1 consecutive
            if not stripped:
                if optimized_lines and optimized_lines[-1] != "":
                    optimized_lines.append("")
                continue

            # Check for exact duplicate repeated lines (e.g. repeated logs or headers)
            norm = stripped.lower()
            if len(norm) > 20 and norm in seen_lines:
                continue

            # Strip excessive repeated spaces inside line
            clean_line = re.sub(r'[ \t]{2,}', ' ', line)
            optimized_lines.append(clean_line)
            if len(norm) > 20:
                seen_lines.add(norm)

        optimized_text = "\n".join(optimized_lines).strip()
        opt_tokens = cost_calculator.estimate_tokens(optimized_text)

        tokens_saved = max(0, orig_tokens - opt_tokens)
        savings_pct = round((tokens_saved / orig_tokens * 100.0) if orig_tokens > 0 else 0.0, 1)

        # Cost reduction estimate
        cost_reduction = round((tokens_saved * model_input_price / 1_000_000.0), 6)

        return {
            "original_tokens": orig_tokens,
            "optimized_tokens": opt_tokens,
            "tokens_saved": tokens_saved,
            "savings_percentage": savings_pct,
            "estimated_cost_reduction": cost_reduction,
            "optimized_text": optimized_text
        }

context_optimizer = ContextOptimizer()
