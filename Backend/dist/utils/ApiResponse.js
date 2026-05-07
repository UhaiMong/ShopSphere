"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = exports.getPaginationMeta = exports.ApiResponse = void 0;
// Standard Response Shape
// response:
// { success, message, data, pagination? }
class ApiResponse {
    static success(res, data, message = "Success", statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static created(res, data, message = "Created successfully") {
        return ApiResponse.success(res, data, message, 201);
    }
    static paginated(res, data, pagination, message = "Success") {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination,
        });
    }
    static noContent(res) {
        return res.status(204).send();
    }
}
exports.ApiResponse = ApiResponse;
// Pagination Helper
const getPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
});
exports.getPaginationMeta = getPaginationMeta;
// Parse pagination query params
const parsePagination = (query, maxLimit = 50) => {
    const page = Math.max(1, parseInt(String(query.page ?? 1), 10));
    const limit = Math.min(maxLimit, Math.max(1, parseInt(String(query.limit ?? 20), 10)));
    return { page, limit, skip: (page - 1) * limit };
};
exports.parsePagination = parsePagination;
//# sourceMappingURL=ApiResponse.js.map