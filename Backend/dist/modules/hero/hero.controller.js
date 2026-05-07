"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroController = void 0;
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const hero_service_1 = require("./hero.service");
exports.heroController = {
    // GET /hero/active
    getActived: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const heroes = await hero_service_1.heroService.getActivedSlides();
        ApiResponse_1.ApiResponse.success(res, heroes);
    }),
    // GET /hero/all (admin)
    getAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const heroes = await hero_service_1.heroService.getAllSlides();
        ApiResponse_1.ApiResponse.success(res, heroes);
    }),
    // POST /hero (admin)
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const hero = await hero_service_1.heroService.create(req.body);
        ApiResponse_1.ApiResponse.created(res, hero, 'Hero created successfully');
    }),
    // PATCH /hero/:id (admin)
    updateHero: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const updated = await hero_service_1.heroService.update(req.params.id, req.body);
        ApiResponse_1.ApiResponse.success(res, updated, 'Hero updated successfully');
    }),
    // DELETE /hero/:id (soft delete, admin)
    softDelete: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const hero = await hero_service_1.heroService.softDelete(req.params.id);
        ApiResponse_1.ApiResponse.success(res, hero, 'Hero soft deleted successfully');
    }),
    // DELETE /hero/:id/permanent (hard delete, admin)
    deleteHero: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const hero = await hero_service_1.heroService.delete(req.params.id);
        ApiResponse_1.ApiResponse.success(res, hero, 'Hero permanently deleted');
    }),
};
//# sourceMappingURL=hero.controller.js.map