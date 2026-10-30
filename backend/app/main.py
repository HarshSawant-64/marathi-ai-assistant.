from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from app.api.routes import assistant, consent, health, status
from app.core.errors import safe_validation_error

app = FastAPI(
    title="AwaazSetu Prototype API",
    version="0.1.0",
    description="Mock-mode API with optional provider adapters; no provider calls are made by default.",
)
app.add_exception_handler(RequestValidationError, safe_validation_error)

app.include_router(health.router)
app.include_router(assistant.router, prefix="/v1")
app.include_router(consent.router, prefix="/v1")
app.include_router(status.router, prefix="/v1")
