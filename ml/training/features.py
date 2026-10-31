"""
SmartRoute AI - Text Feature Extractor for ML Pipeline
"""

import re
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class TextFeatureExtractor(BaseEstimator, TransformerMixin):
    """Extracts structural and stylistic features from prompt text."""
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        features = []
        for text in X:
            t = str(text)
            length = len(t)
            words = len(t.split())
            avg_word_len = length / max(words, 1)
            code_chars = len(re.findall(r'[{};()\[\]<>=_#*&|\\]', t))
            code_ratio = code_chars / max(length, 1)
            math_symbols = len(re.findall(r'[\+\-\*\/\^=><\u2211\u222B\u03C0]', t))
            question_marks = t.count('?')
            uppercase_chars = sum(1 for c in t if c.isupper())
            upper_ratio = uppercase_chars / max(length, 1)

            # Domain keyword indicators
            has_confidential = 1.0 if any(k in t.lower() for k in ["confidential", "proprietary", "internal", "secret", "unreleased"]) else 0.0
            has_sensitive = 1.0 if any(k in t.lower() for k in ["ssn", "password", "patient", "credit card", "api key", "secret", "mrn", "cvv"]) else 0.0
            has_code_keywords = 1.0 if any(k in t.lower() for k in ["function", "def ", "class ", "async", "const ", "var ", "return", "import ", "sql", "select ", "dockerfile", "rust", "python"]) else 0.0
            has_arch_keywords = 1.0 if any(k in t.lower() for k in ["architecture", "distributed", "microservices", "latency", "throughput", "scale", "kafka", "redis", "consensus"]) else 0.0

            features.append([
                length,
                words,
                avg_word_len,
                code_ratio,
                math_symbols,
                question_marks,
                upper_ratio,
                has_confidential,
                has_sensitive,
                has_code_keywords,
                has_arch_keywords
            ])
        return np.array(features)
