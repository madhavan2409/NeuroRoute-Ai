"""
SmartRoute AI - Security Guard & Privacy Inspection Service
Protects against prompt injection, detects PII / sensitive data, enforces safety policies.
"""

import re
from typing import Dict, List, Tuple
from backend.app.models.database import SecurityEvent, SessionLocal

# Common regex patterns for PII and secrets
PATTERNS = {
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
    "credit_card": r"\b(?:\d{4}[ -]?){3}\d{4}\b",
    "aws_key": r"\bAKIA[0-9A-Z]{16}\b",
    "jwt_token": r"\beyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b",
    "generic_api_key": r"\b(?:sk-[a-zA-Z0-9]{20,}|key-[a-zA-Z0-9]{20,})\b",
    "email_address": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
}

# Prompt injection heuristics
INJECTION_SIGNALS = [
    r"ignore (all )?(previous|preceding) instructions",
    r"system override",
    r"you are now (dan|jailbroken|unfiltered)",
    r"bypass (all )?safety (filters|protocols|guidelines)",
    r"reveal (the )?(system prompt|hidden prompt|provider credentials|api key)",
    r"output (the )?system instructions verbatim",
    r"disregard (the )?above",
    r"print your initial instructions"
]

class SecurityGuard:
    def __init__(self):
        self.injection_compiled = [re.compile(p, re.IGNORECASE) for p in INJECTION_SIGNALS]
        self.pii_compiled = {k: re.compile(p) for k, p in PATTERNS.items()}

    def inspect_prompt(self, prompt: str) -> Dict[str, any]:
        flagged_reasons = []
        contains_injection = False
        contains_pii = False
        sanitized = prompt

        # 1. Prompt Injection Check
        for pattern in self.injection_compiled:
            if pattern.search(prompt):
                contains_injection = True
                flagged_reasons.append("Prompt Injection Pattern Detected")
                break

        # 2. PII / Secret Check
        detected_pii_types = []
        for pii_type, pattern in self.pii_compiled.items():
            matches = pattern.findall(prompt)
            if matches:
                contains_pii = True
                detected_pii_types.append(pii_type)
                # Mask sensitive info in sanitized string
                sanitized = pattern.sub(f"[REDACTED_{pii_type.upper()}]", sanitized)

        if contains_pii:
            flagged_reasons.append(f"Sensitive Data Detected ({', '.join(detected_pii_types)})")

        # Determine overall safety and risk level
        if contains_injection:
            risk_level = "critical"
            is_safe = False
        elif contains_pii:
            risk_level = "high"
            is_safe = True  # Can proceed if routed to a private/local Tier-4 model
        else:
            risk_level = "low"
            is_safe = True

        return {
            "is_safe": is_safe,
            "risk_level": risk_level,
            "flagged_reasons": flagged_reasons,
            "contains_pii": contains_pii,
            "contains_injection": contains_injection,
            "detected_pii_types": detected_pii_types,
            "sanitized_prompt": sanitized
        }

    def log_security_event(self, event_type: str, severity: str, prompt: str, action_taken: str, details: str = ""):
        """Persists security event to database."""
        try:
            with SessionLocal() as db:
                event = SecurityEvent(
                    event_type=event_type,
                    severity=severity,
                    prompt_preview=prompt[:150],
                    action_taken=action_taken,
                    details=details
                )
                db.add(event)
                db.commit()
        except Exception as e:
            print(f"Error logging security event: {e}")

security_guard = SecurityGuard()
