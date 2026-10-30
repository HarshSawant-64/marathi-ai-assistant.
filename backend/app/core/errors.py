from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def safe_validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return field errors without echoing submitted values into the response."""
    fields = [
        {
            "field": ".".join(str(part) for part in error.get("loc", ())),
            "message": error.get("msg", "Invalid value"),
            "type": error.get("type", "value_error"),
        }
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"error": "invalid_request", "fields": fields})
