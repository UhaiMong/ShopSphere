"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE_OPTIONS = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../../config/env.config");
//  generateTokenPair
// Access token: short-lived (15m)
// Refresh token: long-lived (7d), sent as httpOnly cookie
const generateTokenPair = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, env_config_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_config_1.env.JWT_ACCESS_EXPIRE,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ _id: payload._id }, env_config_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_config_1.env.JWT_REFRESH_EXPIRE,
    });
    return { accessToken, refreshToken };
};
exports.generateTokenPair = generateTokenPair;
// verifyAccessToken
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
// verifyRefreshToken
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
// Cookie options for refresh token
exports.REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_config_1.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
};
//# sourceMappingURL=jwt.service.js.map