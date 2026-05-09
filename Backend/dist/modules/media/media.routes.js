"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const media_controller_1 = require("./media.controller");
const media_validator_1 = require("./media.validator");
exports.mediaRouter = (0, express_1.Router)();
// ── Admin
exports.mediaRouter.get('/', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), (0, validate_middleware_1.validate)(media_validator_1.mediaQuerySchema, 'query'), media_controller_1.mediaController.getAll);
// Media post
exports.mediaRouter.post('/', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), upload_middleware_1.upload.single('imgURL'), (0, upload_middleware_1.processImages)('media'), (0, validate_middleware_1.validate)(media_validator_1.createMediaSchema), media_controller_1.mediaController.create);
exports.mediaRouter.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), upload_middleware_1.upload.single('images'), (0, upload_middleware_1.processImages)('media'), (0, validate_middleware_1.validate)(media_validator_1.updatMediaSchema), media_controller_1.mediaController.updateByPatch);
// Soft delete
exports.mediaRouter.put('/:id/trash', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), media_controller_1.mediaController.remove);
// Restore
exports.mediaRouter.put('/:id/restore', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), media_controller_1.mediaController.restore);
// Hard delete
exports.mediaRouter.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), media_controller_1.mediaController.delete);
//# sourceMappingURL=media.routes.js.map