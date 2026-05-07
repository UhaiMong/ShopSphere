"use strict";
//  ApiError
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    code;
    isOperational;
    errors;
    constructor(statusCode, message, code = "INTERNAL_ERROR", errors, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.errors = errors;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
    //  Factory Helpers
    static badRequest(message, errors) {
        return new ApiError(400, message, "BAD_REQUEST", errors);
    }
    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message, "UNAUTHORIZED");
    }
    static forbidden(message = "Forbidden") {
        return new ApiError(403, message, "FORBIDDEN");
    }
    static notFound(resource = "Resource") {
        return new ApiError(404, `${resource} not found`, "NOT_FOUND");
    }
    static conflict(message) {
        return new ApiError(409, message, "CONFLICT");
    }
    static tooManyRequests(message = "Too many requests") {
        return new ApiError(429, message, "TOO_MANY_REQUESTS");
    }
    static internal(message = "Internal server error") {
        return new ApiError(500, message, "INTERNAL_ERROR", undefined, false);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map