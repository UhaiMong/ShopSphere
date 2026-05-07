export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    readonly errors?: unknown[];
    constructor(statusCode: number, message: string, code?: string, errors?: unknown[], isOperational?: boolean);
    static badRequest(message: string, errors?: unknown[]): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(resource?: string): ApiError;
    static conflict(message: string): ApiError;
    static tooManyRequests(message?: string): ApiError;
    static internal(message?: string): ApiError;
}
//# sourceMappingURL=ApiError.d.ts.map