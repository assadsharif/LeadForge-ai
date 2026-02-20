import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = structlog.get_logger()


class DomainException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainException)
    async def domain_exception_handler(
        request: Request, exc: DomainException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message, "code": exc.code, "field": None},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.error("unhandled_exception", exc_info=exc, path=request.url.path)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected error occurred.",
                "code": "INTERNAL_ERROR",
                "field": None,
            },
        )
