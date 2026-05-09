"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const product_validator_1 = require("./product.validator");
const product_controller_1 = require("./product.controller");
exports.productRouter = (0, express_1.Router)();
// Public
exports.productRouter.get('/', (0, validate_middleware_1.validate)(product_validator_1.productQuerySchema, 'query'), product_controller_1.productController.getAll);
exports.productRouter.get('/featured', product_controller_1.productController.getFeatured);
exports.productRouter.get('/:idOrSlug', auth_middleware_1.optionalAuth, product_controller_1.productController.getOne);
exports.productRouter.get('/:id/related', product_controller_1.productController.getRelated);
// Admin
// Post
exports.productRouter.post('/', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), (0, validate_middleware_1.validate)(product_validator_1.createProductSchema), product_controller_1.productController.create);
// PUT
exports.productRouter.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), (0, validate_middleware_1.validate)(product_validator_1.updateProductSchema), product_controller_1.productController.update);
// PATCH:
exports.productRouter.patch('/:id/stock', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), product_controller_1.productController.updateStock);
// DELETE
exports.productRouter.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), product_controller_1.productController.remove);
exports.productRouter.delete('/:id/images', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), product_controller_1.productController.deleteImage);
//# sourceMappingURL=product.routes.js.map