// Base y catálogo de errores HTTP reutilizables
class AppError extends Error {
    constructor(
        message,
        { status = 500, code = "INTERNAL_ERROR", details = null } = {}
    ) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(message = "Solicitud inválida", details) {
        super(message, { status: 400, code: "BAD_REQUEST", details });
    }
}
class UnauthorizedError extends AppError {
    constructor(message = "No autorizado", details) {
        super(message, { status: 401, code: "UNAUTHORIZED", details });
    }
}
class ForbiddenError extends AppError {
    constructor(message = "Prohibido", details) {
        super(message, { status: 403, code: "FORBIDDEN", details });
    }
}
class NotFoundError extends AppError {
    constructor(message = "No encontrado", details) {
        super(message, { status: 404, code: "NOT_FOUND", details });
    }
}
class ConflictError extends AppError {
    constructor(message = "Conflicto", details) {
        super(message, { status: 409, code: "CONFLICT", details });
    }
}
class UnprocessableEntityError extends AppError {
    constructor(message = "Entidad no procesable", details) {
        super(message, { status: 422, code: "UNPROCESSABLE_ENTITY", details });
    }
}
class InternalServerError extends AppError {
    constructor(message = "Error interno", details) {
        super(message, { status: 500, code: "INTERNAL_ERROR", details });
    }
}

export function notFound(req, res, next) {
    next(
        new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`)
    );
}

export function errorHandler(err, _req, res, _next) {
    //Guard Conditional: Si el error no es una instancia de AppError
    if (!(err instanceof AppError)) {
        console.error(err); // Log real del error desconocido
        return res.status(500).json({
            ok: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err?.message || "Error interno del servidor",
                details: null,
            },
        });
    }

    // Si llegamos aquí, err es AppError
    if (err.status >= 500) console.error(err);

    res.status(err.status).json({
        ok: false,
        error: {
            code: err.code,
            message: err.message,
            details: err.details ?? null,
        },
    });
}
