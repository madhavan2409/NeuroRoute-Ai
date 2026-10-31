"""
SmartRoute AI - FinOps Analytics & Reporting Engine
Calculates real database-driven metrics, spending trends, model usage distribution,
complexity distributions, cache hit rates, cost per successful outcome, and CSV export.
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import io
import csv
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.database import (
    RequestRecord, ModelRegistry, Provider, CacheEntry, RoutingDecision
)

class AnalyticsService:
    def get_dashboard_summary(self, db: Session, timeframe: str = "7d") -> Dict[str, Any]:
        """Calculates 8 primary KPI cards and system health metrics."""
        now = datetime.now(timezone.utc)
        if timeframe == "24h":
            start_date = now - timedelta(days=1)
        elif timeframe == "30d":
            start_date = now - timedelta(days=30)
        elif timeframe == "90d":
            start_date = now - timedelta(days=90)
        else:  # default 7d
            start_date = now - timedelta(days=7)

        # Base query for timeframe
        q = db.query(RequestRecord).filter(RequestRecord.created_at >= start_date)
        total_requests = q.count()
        total_spend = db.query(func.sum(RequestRecord.actual_cost)).filter(RequestRecord.created_at >= start_date).scalar() or 0.0
        total_tokens = db.query(func.sum(RequestRecord.total_tokens)).filter(RequestRecord.created_at >= start_date).scalar() or 0
        avg_latency = db.query(func.avg(RequestRecord.latency_ms)).filter(RequestRecord.created_at >= start_date).scalar() or 0.0
        successful_requests = q.filter(RequestRecord.success == True).count()
        avg_quality = db.query(func.avg(RequestRecord.quality_score)).filter(RequestRecord.created_at >= start_date).scalar() or 90.0

        # Calculate cost savings compared to unrouted baseline ($5.00/$15.00 per M)
        baseline_cost = 0.0
        requests = q.all()
        for r in requests:
            baseline_cost += ((r.input_tokens * 5.0 / 1_000_000.0) + (r.output_tokens * 15.0 / 1_000_000.0))
        cost_savings = max(0.0, baseline_cost - total_spend)
        savings_pct = (cost_savings / baseline_cost * 100.0) if baseline_cost > 0 else 0.0

        # Cost per successful outcome: Total AI Cost / Number of Successful AI Outcomes
        cost_per_successful_outcome = (total_spend / successful_requests) if successful_requests > 0 else 0.0

        # Active AI Models count
        active_models_count = db.query(ModelRegistry).filter(ModelRegistry.is_active == True).count()

        # Cache metrics
        total_cache_entries = db.query(CacheEntry).count()
        cache_hits = q.filter(RequestRecord.cache_hit == True).count()
        cache_hit_rate = (cache_hits / total_requests * 100.0) if total_requests > 0 else 0.0

        # Model distribution
        model_dist = (
            db.query(
                RequestRecord.selected_model_id,
                func.count(RequestRecord.id).label("count"),
                func.sum(RequestRecord.actual_cost).label("spend")
            )
            .filter(RequestRecord.created_at >= start_date)
            .group_by(RequestRecord.selected_model_id)
            .all()
        )
        model_distribution_data = []
        for m_id, count, spend in model_dist:
            model_obj = db.query(ModelRegistry).filter(ModelRegistry.id == m_id).first()
            name = model_obj.name if model_obj else f"Model #{m_id or 'Unknown'}"
            model_distribution_data.append({
                "name": name,
                "count": count,
                "spend": round(spend or 0.0, 4)
            })

        # Complexity distribution
        comp_dist = (
            db.query(
                RequestRecord.complexity,
                func.count(RequestRecord.id)
            )
            .filter(RequestRecord.created_at >= start_date)
            .group_by(RequestRecord.complexity)
            .all()
        )
        complexity_data = {"simple": 0, "medium": 0, "advanced": 0}
        for comp, count in comp_dist:
            if comp in complexity_data:
                complexity_data[comp] = count

        # Spending chart over time (daily buckets)
        daily_trend = self._get_daily_spending_trend(db, start_date, now)

        # Provider availability & system health
        providers = db.query(Provider).all()
        provider_health = []
        for p in providers:
            provider_health.append({
                "name": p.name,
                "slug": p.slug,
                "status": p.status,
                "latency_ms": p.latency_ms,
                "error_rate": p.error_rate,
                "is_active": p.is_active
            })

        # Workflow Routing Stats
        routing_decisions = (
            db.query(RoutingDecision)
            .join(RequestRecord)
            .filter(RequestRecord.created_at >= start_date)
            .all()
        )
        fallback_count = sum(1 for rd in routing_decisions if rd.fallback_triggered)
        primary_path_pct = round(((total_requests - fallback_count) / max(total_requests, 1)) * 100.0, 1)
        fallback_path_pct = round((fallback_count / max(total_requests, 1)) * 100.0, 1)

        return {
            "timeframe": timeframe,
            "kpis": {
                "total_spending": round(total_spend, 4),
                "total_requests": total_requests,
                "total_tokens": total_tokens,
                "cost_savings": round(cost_savings, 4),
                "cost_savings_pct": round(savings_pct, 1),
                "avg_response_time_ms": round(avg_latency, 1),
                "successful_outcomes": successful_requests,
                "success_rate_pct": round((successful_requests / max(total_requests, 1)) * 100.0, 1),
                "avg_quality_score": round(avg_quality, 1),
                "active_models": active_models_count,
                "cost_per_successful_outcome": round(cost_per_successful_outcome, 5),
                "cache_hit_rate": round(cache_hit_rate, 1),
                "total_cache_entries": total_cache_entries
            },
            "spending_trend": daily_trend,
            "model_distribution": model_distribution_data,
            "complexity_distribution": complexity_data,
            "provider_health": provider_health,
            "routing_paths": {
                "primary_path_percentage": primary_path_pct,
                "fallback_path_percentage": fallback_path_pct,
                "total_routed": total_requests,
                "successful_requests": successful_requests,
                "failed_requests": total_requests - successful_requests
            }
        }

    def _get_daily_spending_trend(self, db: Session, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        trend = []
        days = max(1, (end_date - start_date).days)
        # Create daily buckets
        for i in range(days + 1):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            spend = (
                db.query(func.sum(RequestRecord.actual_cost))
                .filter(RequestRecord.created_at >= day_start, RequestRecord.created_at < day_end)
                .scalar() or 0.0
            )
            tokens = (
                db.query(func.sum(RequestRecord.total_tokens))
                .filter(RequestRecord.created_at >= day_start, RequestRecord.created_at < day_end)
                .scalar() or 0
            )
            reqs = (
                db.query(func.count(RequestRecord.id))
                .filter(RequestRecord.created_at >= day_start, RequestRecord.created_at < day_end)
                .scalar() or 0
            )
            trend.append({
                "date": day_start.strftime("%b %d"),
                "spend": round(spend, 4),
                "tokens": tokens,
                "requests": reqs
            })
        return trend

    def export_csv(self, db: Session) -> str:
        """Exports all request and FinOps cost records to CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Request ID", "Timestamp", "Prompt Preview", "Task Type", "Complexity",
            "Privacy", "Model", "Provider", "Input Tokens", "Output Tokens",
            "Total Tokens", "Estimated Cost ($)", "Actual Cost ($)", "Latency (ms)",
            "Quality Score", "Cache Hit", "Success"
        ])

        records = db.query(RequestRecord).order_by(RequestRecord.created_at.desc()).limit(1000).all()
        for r in records:
            writer.writerow([
                r.request_id,
                r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
                r.prompt[:60].replace("\n", " "),
                r.task_type,
                r.complexity,
                r.privacy,
                r.model.name if r.model else r.selected_model_id,
                r.selected_provider,
                r.input_tokens,
                r.output_tokens,
                r.total_tokens,
                f"{r.estimated_cost:.6f}",
                f"{r.actual_cost:.6f}",
                f"{r.latency_ms:.1f}",
                f"{r.quality_score:.1f}",
                "Yes" if r.cache_hit else "No",
                "Yes" if r.success else "No"
            ])

        return output.getvalue()

analytics_service = AnalyticsService()
