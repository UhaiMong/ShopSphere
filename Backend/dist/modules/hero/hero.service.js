"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroService = void 0;
const Hero_model_1 = require("@/models/Hero.model");
const ApiError_1 = require("@/utils/ApiError");
exports.heroService = {
    // get all active slides
    async getActivedSlides() {
        const heroes = await Hero_model_1.Hero.find({ isActive: true });
        if (!heroes || heroes.length === 0)
            throw ApiError_1.ApiError.notFound('Active Hero Slides');
        return heroes.map((h) => h.toObject());
    },
    // get all slides (admin dashboard)
    async getAllSlides() {
        const heroes = await Hero_model_1.Hero.find();
        if (!heroes || heroes.length === 0)
            throw ApiError_1.ApiError.notFound('Hero Slides');
        return heroes.map((h) => h.toObject());
    },
    // create
    async create(data) {
        const hero = await Hero_model_1.Hero.create(data);
        return hero.toObject();
    },
    // update
    async update(id, data) {
        const hero = await Hero_model_1.Hero.findByIdAndUpdate(id, data, { new: true });
        if (!hero)
            throw ApiError_1.ApiError.notFound('Hero');
        return hero.toObject();
    },
    // soft delete (set isActive: false)
    async softDelete(id) {
        const hero = await Hero_model_1.Hero.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!hero)
            throw ApiError_1.ApiError.notFound('Hero');
        return hero.toObject();
    },
    // permanent delete
    async delete(id) {
        const hero = await Hero_model_1.Hero.findByIdAndDelete(id);
        if (!hero)
            throw ApiError_1.ApiError.notFound('Hero');
        return hero.toObject();
    },
};
//# sourceMappingURL=hero.service.js.map