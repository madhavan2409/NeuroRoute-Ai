"""
SmartRoute AI - Semantic Caching Engine
Dense vector representation and cosine similarity for high-speed semantic cache lookups.
Zero-network dependency: uses deterministic subword & character TF-IDF projections,
ensuring offline robustness and sub-millisecond lookups.
Strict privacy firewall: Sensitive and confidential queries are NEVER cached.
"""

import hashlib
import json
import math
import re
import numpy as np
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.database import CacheEntry, SessionLocal

class SemanticCache:
    def __init__(self):
        self.threshold = settings.SEMANTIC_CACHE_THRESHOLD
        self.enabled = settings.SEMANTIC_CACHE_ENABLED
        self.dim = 128

    def _get_embedding(self, text: str) -> List[float]:
        """
        Generates a 128-dimensional deterministic semantic embedding vector
        based on character and word n-grams with L2 normalization.
        """
        clean = text.strip().lower()
        vec = np.zeros(self.dim, dtype=np.float32)

        # Word n-grams
        words = clean.split()
        for i, w in enumerate(words):
            # Positional decay weighting
            pos_weight = 1.0 / (1.0 + 0.05 * i)
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dim
            vec[idx] += pos_weight * (1.0 if (h >> 8) % 2 == 0 else -1.0)

            # Bigram feature
            if i < len(words) - 1:
                bi = f"{w}_{words[i+1]}"
                h_bi = int(hashlib.md5(bi.encode("utf-8")).hexdigest(), 16)
                idx_bi = h_bi % self.dim
                vec[idx_bi] += (pos_weight * 1.5) * (1.0 if (h_bi >> 8) % 2 == 0 else -1.0)

        # Character tri-grams for subword morphological capture
        for j in range(len(clean) - 2):
            tri = clean[j:j+3]
            h_tri = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16)
            idx_tri = h_tri % self.dim
            vec[idx_tri] += 0.3 * (1.0 if (h_tri >> 8) % 2 == 0 else -1.0)

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        dot = float(np.dot(a, b))
        return max(0.0, min(1.0, dot))

    def lookup(
        self,
        prompt: str,
        task_type: str = "general",
        privacy: str = "public",
        db: Optional[Session] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], float]:
        """
        Looks up prompt in semantic cache.
        Returns: (is_hit, cached_data, similarity_score)
        """
        if not self.enabled:
            return False, None, 0.0

        # Strict privacy rule: Do not serve cached answers for sensitive/confidential queries
        if privacy in ["sensitive", "confidential"]:
            return False, None, 0.0

        prompt_hash = hashlib.sha256(prompt.strip().encode("utf-8")).hexdigest()
        query_vec = self._get_embedding(prompt)

        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True

        try:
            # 1. Exact hash check (instant 1.0 match)
            exact_match = db.query(CacheEntry).filter(CacheEntry.prompt_hash == prompt_hash).first()
            if exact_match and exact_match.privacy == "public":
                exact_match.hit_count += 1
                db.commit()
                return True, {
                    "id": exact_match.id,
                    "response_text": exact_match.response_text,
                    "model_name": exact_match.model_name,
                    "task_type": exact_match.task_type,
                    "hit_count": exact_match.hit_count
                }, 1.0

            # 2. Semantic vector scan
            entries = db.query(CacheEntry).filter(CacheEntry.privacy == "public").all()
            best_sim = 0.0
            best_entry = None
            query_words = set(re.findall(r'\b\w+\b', prompt.lower()))

            for entry in entries:
                if not entry.embedding:
                    continue
                # Task type compatibility check
                if entry.task_type and task_type and entry.task_type != task_type:
                    continue

                # Lexical similarity check (prevent false positives on short disparate queries)
                entry_words = set(re.findall(r'\b\w+\b', entry.prompt_text.lower()))
                if query_words and entry_words:
                    intersection = len(query_words & entry_words)
                    union = len(query_words | entry_words)
                    jaccard = intersection / max(1, union)
                    if jaccard < 0.35 and len(query_words) < 8:
                        continue

                try:
                    entry_vec = json.loads(entry.embedding)
                    sim = self._cosine_similarity(query_vec, entry_vec)
                    if sim > best_sim:
                        best_sim = sim
                        best_entry = entry
                except Exception:
                    continue

            if best_sim >= self.threshold and best_entry is not None:
                best_entry.hit_count += 1
                db.commit()
                return True, {
                    "id": best_entry.id,
                    "response_text": best_entry.response_text,
                    "model_name": best_entry.model_name,
                    "task_type": best_entry.task_type,
                    "hit_count": best_entry.hit_count
                }, round(best_sim, 4)

            return False, None, round(best_sim, 4)

        finally:
            if should_close:
                db.close()

    def store(
        self,
        prompt: str,
        response_text: str,
        task_type: str,
        complexity: str,
        privacy: str,
        model_name: str,
        tokens_saved: int = 0,
        cost_saved: float = 0.0,
        db: Optional[Session] = None
    ) -> Optional[int]:
        """Stores a new response in cache if privacy permits."""
        if not self.enabled or privacy in ["sensitive", "confidential"]:
            return None

        prompt_hash = hashlib.sha256(prompt.strip().encode("utf-8")).hexdigest()
        query_vec = self._get_embedding(prompt)

        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True

        try:
            existing = db.query(CacheEntry).filter(CacheEntry.prompt_hash == prompt_hash).first()
            if existing:
                existing.response_text = response_text
                existing.model_name = model_name
                db.commit()
                return existing.id

            entry = CacheEntry(
                prompt_hash=prompt_hash,
                prompt_text=prompt,
                response_text=response_text,
                embedding=json.dumps(query_vec),
                task_type=task_type,
                complexity=complexity,
                privacy=privacy,
                model_name=model_name,
                token_savings=tokens_saved,
                cost_savings=cost_saved
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            return entry.id
        except Exception as e:
            print(f"Error storing in cache: {e}")
            db.rollback()
            return None
        finally:
            if should_close:
                db.close()

semantic_cache = SemanticCache()
