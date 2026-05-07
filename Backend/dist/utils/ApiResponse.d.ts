import { Response } from "express";
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class ApiResponse {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static paginated<T>(res: Response, data: T[], pagination: PaginationMeta, message?: string): Response;
    static noContent(res: Response): Response;
}
export declare const getPaginationMeta: (total: number, page: number, limit: number) => PaginationMeta;
export declare const parsePagination: (query: Record<string, unknown>, maxLimit?: number) => {
    page: number;
    limit: number;
    skip: number;
};
//# sourceMappingURL=ApiResponse.d.ts.map