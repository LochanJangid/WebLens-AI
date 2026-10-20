from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.audit import router as audit_router
from app.routers.chat import router as chat_router
from app.routers.visual_improve import router as visual_improve_router
from app.routers.agent_bridge import router as agent_bridge_router

app = FastAPI(
    title="WebLensAI API",
    description=(
        "Production-grade evidence-based website intelligence and screenshot-driven "
        "AI visual improvement studio. Built by Lochan Jangid."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(visual_improve_router, prefix="/api/v1")
app.include_router(agent_bridge_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "weblensai-api",
        "company": "WebLensAI",
        "creator": "Lochan Jangid",
        "version": "1.0.0",
    }
