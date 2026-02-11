from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_router import api_router
from app.core.config import settings, parse_cors_origins
from app.db.init_db import init_db
from app.services.websocket_manager import websocket_router


def create_app() -> FastAPI:
    app = FastAPI(title="ChatApp API", version="0.1.0")

    @app.on_event("startup")
    def _init_db() -> None:
        init_db()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=parse_cors_origins(settings.CORS_ORIGINS),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api")
    app.include_router(websocket_router)
    return app


app = create_app()
