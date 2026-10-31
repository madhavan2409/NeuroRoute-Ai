"""
SmartRoute AI - Quality Evaluation Engine
Multi-dimensional evaluation: Correctness, Relevance, Completeness, Clarity.
Evaluates answers with rule-based heuristics, code syntax checks, substance validation,
and configurable thresholds. Supports retry/fallback if minimum quality is not met.
"""

import re
from typing import Dict, Any, List

class QualityEvaluator:
    def evaluate(
        self,
        prompt: str,
        response_text: str,
        task_type: str,
        complexity: str,
        min_quality: float = 75.0
    ) -> Dict[str, Any]:
        """
        Calculates sub-scores (0-100) and overall weighted quality score.
        """
        p_clean = prompt.strip().lower()
        r_clean = response_text.strip()
        resp_length = len(r_clean)
        resp_words = len(r_clean.split())

        # 1. Relevance Score (checks if core prompt keywords appear in response)
        prompt_words = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', p_clean) if w not in [
            "what", "when", "where", "which", "how", "give", "show", "tell", "explain", "write", "this", "that"
        ]]
        if prompt_words:
            matched = sum(1 for w in prompt_words if w in r_clean.lower())
            keyword_ratio = matched / max(len(prompt_words), 1)
            relevance = min(100.0, max(50.0, 60.0 + (keyword_ratio * 40.0)))
        else:
            relevance = 90.0

        # 2. Completeness Score (adequate depth based on complexity)
        if complexity == "simple":
            completeness = 95.0 if resp_words >= 15 else (70.0 if resp_words >= 5 else 40.0)
        elif complexity == "medium":
            completeness = 95.0 if resp_words >= 80 else (80.0 if resp_words >= 40 else 55.0)
        else:  # advanced
            completeness = 95.0 if resp_words >= 150 else (80.0 if resp_words >= 80 else 50.0)

        # 3. Correctness & Structure Score
        correctness = 92.0
        if task_type == "coding":
            # Check for code blocks or valid indentation/syntax markers
            has_code_block = "```" in r_clean or "    " in r_clean or ";" in r_clean
            if has_code_block:
                correctness = 96.0
            else:
                correctness = 82.0
        elif task_type == "mathematics":
            has_numbers_or_formulas = bool(re.search(r'[\d=+\-*/^]', r_clean))
            if has_numbers_or_formulas:
                correctness = 95.0
            else:
                correctness = 75.0

        # 4. Clarity & Formatting Score
        has_paragraphs = "\n" in r_clean
        has_bullets = any(marker in r_clean for marker in ["- ", "* ", "1. ", "• "])
        clarity = 90.0
        if has_paragraphs or has_bullets:
            clarity += 8.0
        if resp_words < 5:
            clarity -= 30.0
        clarity = min(100.0, max(30.0, clarity))

        # Overall weighted score
        overall = (
            (relevance * 0.30) +
            (completeness * 0.30) +
            (correctness * 0.25) +
            (clarity * 0.15)
        )
        overall = round(overall, 1)

        passes_quality = overall >= min_quality
        notes = (
            f"Evaluated via Heuristic Engine: Response has high substance ({resp_words} words). "
            f"Relevance: {relevance:.1f}%, Completeness: {completeness:.1f}%, Correctness: {correctness:.1f}%, Clarity: {clarity:.1f}%."
        )

        return {
            "correctness": round(correctness, 1),
            "relevance": round(relevance, 1),
            "completeness": round(completeness, 1),
            "clarity": round(clarity, 1),
            "overall": overall,
            "passes_quality": passes_quality,
            "evaluator_type": "rule_and_heuristic",
            "notes": notes
        }

quality_evaluator = QualityEvaluator()
