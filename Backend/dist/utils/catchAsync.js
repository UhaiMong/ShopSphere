"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
// catchAsync
// Usage:
//   router.get('/products', catchAsync(productController.getAll));
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=catchAsync.js.map