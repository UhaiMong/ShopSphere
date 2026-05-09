"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireRole = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const ApiError_1 = require("../utils/ApiError");
//  Protect
const protect = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next(ApiError_1.ApiError.unauthorized("No token provided"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        next(ApiError_1.ApiError.unauthorized("Invalid or expired token"));
    }
};
exports.protect = protect;
//  requireRole
// RBAC guard. Always chain AFTER protect().
//
// Usage:
//   router.delete('/products/:id', protect, requireRole('admin'), ...)
const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user) {
        return next(ApiError_1.ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
        return next(ApiError_1.ApiError.forbidden(`Role '${req.user.role}' is not authorized. Required: ${roles.join(" | ")}`));
    }
    next();
};
exports.requireRole = requireRole;
// optionalAuth
const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return next();
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_ACCESS_SECRET);
        req.user = decoded;
    }
    catch {
        // Ignore invalide tokens for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map