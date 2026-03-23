import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "@/config/env.config";
// import { env } from "@config/env.config.js";

// ─── Error Handler Middleware ──────────────────────────────────────────────────
// Single source of truth for all error responses.
// Maps known error types to consistent ApiError format.

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: ApiError;

  // ── 1. Already an ApiError ─────────────────────────────────────────────────
  if (err instanceof ApiError) {
    error = err;
  }

  // ── 2. Mongoose Validation Error ───────────────────────────────────────────
  else if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest("Validation failed", errors);
  }

  // ── 3. Mongoose Cast Error (invalid ObjectId) ──────────────────────────────
  else if (err instanceof MongooseError.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // ── 4. MongoDB Duplicate Key ───────────────────────────────────────────────
  else if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    error = ApiError.conflict(`${field} already exists`);
  }

  // ── 5. JWT Errors ──────────────────────────────────────────────────────────
  else if (err instanceof TokenExpiredError) {
    error = ApiError.unauthorized("Token expired. Please log in again.");
  } else if (err instanceof JsonWebTokenError) {
    error = ApiError.unauthorized("Invalid token. Please log in again.");
  }

  // ── 6. Zod Validation Error ────────────────────────────────────────────────
  else if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    error = ApiError.badRequest("Validation failed", errors);
  }

  // ── 7. Unknown Errors ──────────────────────────────────────────────────────
  else {
    const message =
      env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : ((err as Error)?.message ?? "Internal server error");
    error = ApiError.internal(message);
  }

  // ── Log non-operational errors ─────────────────────────────────────────────
  if (!error.isOperational) {
    logger.error(
      { err, requestId: req.requestId, path: req.path, method: req.method },
      "Non-operational error",
    );
  }

  // ── Send response ──────────────────────────────────────────────────────────
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.errors && { errors: error.errors }),
    ...(env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// ─── 404 Handler ──────────────────────────────────────────────────────────────
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route ${req.originalUrl}`));
};
