"""
SmartRoute AI - AI Agents Management API Route
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.models.database import get_db, AgentActivity

router = APIRouter(prefix="/agents", tags=["AI Agents"])

AGENTS_CONFIG = [
    {
        "name": "Classification Agent",
        "description": "Analyzes prompt semantics, identifies domain, assigns complexity tier and detects PII.",
        "responsibilities": [
            "Extract semantic word & character n-grams",
            "Classify into Simple, Medium, or Advanced tiers",
            "Identify 8 distinct task categories",
            "Trigger fallback when model confidence is low"
        ],
        "status": "active"
    },
    {
        "name": "Routing Agent",
        "description": "Dynamically selects the cost-optimal model and handles provider failover chains.",
        "responsibilities": [
            "Evaluate active enterprise FinOps routing policies",
            "Map complexity and domain to model tiers (1-4)",
            "Enforce strict privacy firewall for confidential data",
            "Monitor circuit breakers and execute fallback"
        ],
        "status": "active"
    },
    {
        "name": "Cost Optimization Agent",
        "description": "Reduces token consumption via semantic caching and context compression.",
        "responsibilities": [
            "Maintain semantic vector cache with cosine similarity",
            "Strip duplicate prompt tokens and redundant headers",
            "Calculate unrouted baseline cost savings",
            "Monitor budget utilization caps (>90%)"
        ],
        "status": "active"
    },
    {
        "name": "Quality Evaluation Agent",
        "description": "Evaluates response correctness, relevance, completeness, and clarity.",
        "responsibilities": [
            "Run automated heuristic and syntax audits",
            "Verify code block validity and mathematical proofs",
            "Calculate 0-100 multidimensional scorecards",
            "Trigger automatic re-routing if quality < 75"
        ],
        "status": "active"
    },
    {
        "name": "Security Agent",
        "description": "Protects against prompt injection, data exfiltration, and unauthorized key usage.",
        "responsibilities": [
            "Scan incoming prompts for DAN and jailbreak attacks",
            "Detect and redact SSN, credit cards, and API secrets",
            "Enforce token bucket rate limiting per workspace",
            "Log audit trail security events"
        ],
        "status": "active"
    },
    {
        "name": "Monitoring Agent",
        "description": "Monitors AI provider health, latency P50/P99, and error rates.",
        "responsibilities": [
            "Perform periodic synthetic health check pings",
            "Detect provider degradation and 5xx outage spikes",
            "Recalculate dynamic provider health scores",
            "Alert FinOps administrators on anomalies"
        ],
        "status": "active"
    }
]

@router.get("")
def list_agents(db: Session = Depends(get_db)):
    recent_activities = db.query(AgentActivity).order_by(AgentActivity.timestamp.desc()).limit(30).all()
    
    agents_data = []
    for a in AGENTS_CONFIG:
        agent_acts = [act for act in recent_activities if act.agent_name == a["name"]]
        agents_data.append({
            "name": a["name"],
            "description": a["description"],
            "responsibilities": a["responsibilities"],
            "status": a["status"],
            "recent_activity": agent_acts[0].action if agent_acts else "Monitoring live requests in standby mode.",
            "last_active": agent_acts[0].timestamp if agent_acts else datetime.now(timezone.utc)
        })

    return {
        "agents": agents_data,
        "activity_log": recent_activities
    }
