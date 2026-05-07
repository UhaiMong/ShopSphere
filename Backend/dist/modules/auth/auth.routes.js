"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_validator_1 = require("./auth.validator");
const router = (0, express_1.Router)();
// Strict Rate Limiters
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});
const forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again in 1 hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Public Routes : register
router.post('/register', (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), auth_controller_1.authController.register);
// Login
router.post('/login', loginLimiter, (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), auth_controller_1.authController.login);
// Refresh
router.post('/refresh', auth_controller_1.authController.refresh);
// Verify email
router.get('/verify-email/:token', auth_controller_1.authController.verifyEmail);
// Forgot password
router.post('/forgot-password', forgotPasswordLimiter, (0, validate_middleware_1.validate)(auth_validator_1.forgotPasswordSchema), auth_controller_1.authController.forgotPassword);
// Reset password
router.post('/reset-password', (0, validate_middleware_1.validate)(auth_validator_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
// Protected Routes
router.use(auth_middleware_1.protect);
router.get('/me', auth_controller_1.authController.getMe);
router.post('/logout', auth_controller_1.authController.logout);
router.post('/logout-all', auth_controller_1.authController.logoutAll);
router.patch('/change-password', (0, validate_middleware_1.validate)(auth_validator_1.changePasswordSchema), auth_controller_1.authController.changePassword);
router.post('/resend-verification', auth_controller_1.authController.resendVerification);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map