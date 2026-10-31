"""
SmartRoute AI - Autonomous AI FinOps & Intelligent Model Routing Platform
Main FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.models.database import init_db, SessionLocal
from backend.app.core.seed import seed_database

# Import API routers
from backend.app.api.routes.chat import router as chat_router
from backend.app.api.routes.classification import router as class_router
from backend.app.api.routes.routing import router as routing_router
from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.analytics import router as analytics_router
from backend.app.api.routes.models import router as models_router
from backend.app.api.routes.providers import router as providers_router
from backend.app.api.routes.cache import router as cache_router
from backend.app.api.routes.context import router as context_router
from backend.app.api.routes.competition import router as competition_router
from backend.app.api.routes.security import router as security_router
from backend.app.api.routes.budgets import router as budgets_router
from backend.app.api.routes.approvals import router as approvals_router
from backend.app.api.routes.workflows import router as workflows_router
from backend.app.api.routes.agents import router as agents_router
from backend.app.api.routes.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield
    # Shutdown

app = FastAPI(
    title="SmartRoute AI API",
    description="Autonomous AI FinOps & Intelligent Model Routing Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "SmartRoute AI Engine",
        "version": settings.VERSION,
        "app_mode": settings.APP_MODE
    }

# Register API Routers
app.include_router(chat_router, prefix="/api")
app.include_router(class_router, prefix="/api")
app.include_router(routing_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(providers_router, prefix="/api")
app.include_router(cache_router, prefix="/api")
app.include_router(context_router, prefix="/api")
app.include_router(competition_router, prefix="/api")
app.include_router(security_router, prefix="/api")
app.include_router(budgets_router, prefix="/api")
app.include_router(approvals_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
