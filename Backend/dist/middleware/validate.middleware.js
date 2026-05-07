"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const ApiError_1 = require("@/utils/ApiError");
// Validate:
// Usage:
//  router.post('/register', validate(registerSchema), authController.register)
// router.get('/products', validate(productQuerySchema, 'query'), ...)
const validate = (schema, target = "body") => (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        return next(ApiError_1.ApiError.badRequest("Validation failed", errors));
    }
    // (req as Record<string, unknown>)[target] = result.data;
    req[target] = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map