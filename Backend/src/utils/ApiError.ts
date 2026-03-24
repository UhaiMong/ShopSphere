//  ApiError

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: number,
    message: string,
    code = "INTERNAL_ERROR",
    errors?: unknown[],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  //  Factory Helpers
  static badRequest(message: string, errors?: unknown[]): ApiError {
    return new ApiError(400, message, "BAD_REQUEST", errors);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(resource = "Resource"): ApiError {
    return new ApiError(404, `${resource} not found`, "NOT_FOUND");
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, "CONFLICT");
  }

  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(429, message, "TOO_MANY_REQUESTS");
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message, "INTERNAL_ERROR", undefined, false);
  }
}
