"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
const env_config_1 = require("../config/env.config");
//  Error Handler Middleware
const errorHandler = (err, req, res, _next) => {
    let error;
    // Already an ApiError
    if (err instanceof ApiError_1.ApiError) {
        error = err;
    }
    // Mongoose Validation Error
    else if (err instanceof mongoose_1.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        error = ApiError_1.ApiError.badRequest('Validation failed', errors);
    }
    // Mongoose Cast Error (invalid ObjectId)
    else if (err instanceof mongoose_1.Error.CastError) {
        error = ApiError_1.ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }
    // MongoDB Duplicate Key
    else if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
        error = ApiError_1.ApiError.conflict(`${field} already exists`);
    }
    // JWT Errors
    else if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        error = ApiError_1.ApiError.unauthorized('Token expired. Please log in again.');
    }
    else if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        error = ApiError_1.ApiError.unauthorized('Invalid token. Please log in again.');
    }
    // Zod Validation Error
    else if (err instanceof zod_1.ZodError) {
        const errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        error = ApiError_1.ApiError.badRequest('Validation failed', errors);
    }
    // Unknown Errors
    else {
        const message = env_config_1.env.NODE_ENV === 'production'
            ? 'Something went wrong. Please try again later.'
            : (err?.message ?? 'Internal server error');
        error = ApiError_1.ApiError.internal(message);
    }
    // Log non-operational errors
    if (!error.isOperational) {
        logger_1.logger.error({ err, requestId: req.requestId, path: req.path, method: req.method }, 'Non-operational error');
    }
    // Send response
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        ...(error.errors && { errors: error.errors }),
        ...(env_config_1.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
// 404 Handler
const notFoundHandler = (req, _res, next) => {
    next(ApiError_1.ApiError.notFound(`Route ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map