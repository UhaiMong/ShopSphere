"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const hero_controller_1 = require("./hero.controller");
const hero_validator_1 = require("./hero.validator");
exports.heroRouter = (0, express_1.Router)();
// Public
exports.heroRouter.get('/', hero_controller_1.heroController.getActived);
// Admin
exports.heroRouter.get('/all', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), hero_controller_1.heroController.getAll);
// Create
exports.heroRouter.post('/', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), (0, validate_middleware_1.validate)(hero_validator_1.createHeroSchema), hero_controller_1.heroController.create);
// Update
exports.heroRouter.patch('/:id', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), (0, validate_middleware_1.validate)(hero_validator_1.updageHeroSchema), hero_controller_1.heroController.updateHero);
// Soft delete
exports.heroRouter.patch('/:id/soft-delete', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), hero_controller_1.heroController.softDelete);
// Permanent delete
exports.heroRouter.delete('/:id/permanent', auth_middleware_1.protect, (0, auth_middleware_1.requireRole)('admin', 'superadmin'), hero_controller_1.heroController.deleteHero);
//# sourceMappingURL=hero.routes.js.map