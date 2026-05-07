"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const jwt_service_1 = require("./jwt.service");
// Auth Controller
exports.authController = {
    // POST /auth/register
    register: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.register(req.body);
        ApiResponse_1.ApiResponse.created(res, null, result.message);
    }),
    // POST /auth/login
    login: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { user, tokens } = await auth_service_1.authService.login(req.body);
        if (!user.isVerified) {
            throw ApiError_1.ApiError.forbidden('Your email verification is required');
        }
        // Refresh token → httpOnly cookie
        res.cookie('refreshToken', tokens.refreshToken, jwt_service_1.REFRESH_COOKIE_OPTIONS);
        ApiResponse_1.ApiResponse.success(res, {
            user,
            accessToken: tokens.accessToken,
        });
    }),
    // POST /auth/refresh
    refresh: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const incomingToken = req.cookies?.refreshToken;
        if (!incomingToken) {
            throw ApiError_1.ApiError.unauthorized('No refresh token provided');
        }
        const tokens = await auth_service_1.authService.refreshTokens(incomingToken);
        // Rotate refresh cookie
        res.cookie('refreshToken', tokens.refreshToken, jwt_service_1.REFRESH_COOKIE_OPTIONS);
        ApiResponse_1.ApiResponse.success(res, { accessToken: tokens.accessToken });
    }),
    // POST /auth/logout
    logout: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        if (req.user && refreshToken) {
            await auth_service_1.authService.logout(req.user._id, refreshToken);
        }
        // Clear the cookie regardless
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/auth',
        });
        ApiResponse_1.ApiResponse.success(res, null, 'Logged out successfully');
    }),
    // POST /auth/logout-all
    logoutAll: (0, catchAsync_1.catchAsync)(async (req, res) => {
        await auth_service_1.authService.logoutAll(req.user._id);
        res.clearCookie('refreshToken', { path: '/api/v1/auth' });
        ApiResponse_1.ApiResponse.success(res, null, 'Logged out from all devices');
    }),
    // GET /auth/verify-email/:token
    verifyEmail: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.verifyEmail(req.params.token);
        ApiResponse_1.ApiResponse.success(res, null, result.message);
    }),
    // POST /auth/forgot-password
    forgotPassword: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.forgotPassword(req.body);
        ApiResponse_1.ApiResponse.success(res, null, result.message);
    }),
    // POST /auth/reset-password
    resetPassword: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.resetPassword(req.body);
        ApiResponse_1.ApiResponse.success(res, null, result.message);
    }),
    // PATCH /auth/change-password  (protected)
    changePassword: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.changePassword(req.user._id, req.body);
        // Clear cookie — user must re-login
        res.clearCookie('refreshToken', { path: '/api/v1/auth' });
        ApiResponse_1.ApiResponse.success(res, null, result.message);
    }),
    // GET /auth/me  (protected)
    getMe: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await auth_service_1.authService.getMe(req.user._id);
        ApiResponse_1.ApiResponse.success(res, user);
    }),
    // POST /auth/resend-verification  (protected)
    resendVerification: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const result = await auth_service_1.authService.resendVerificationEmail(req.user._id);
        ApiResponse_1.ApiResponse.success(res, null, result.message);
    }),
};
//# sourceMappingURL=auth.controller.js.map