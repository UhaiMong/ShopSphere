import { Request, Response } from "express";
import { authService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { catchAsync } from "../../utils/catchAsync";
import { REFRESH_COOKIE_OPTIONS } from "./jwt.service";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "./auth.validator";

// ─── Auth Controller ──────────────────────────────────────────────────────────
// Controllers are deliberately thin — they handle HTTP concerns only:
//   • Extract validated data from req
//   • Call the service
//   • Set cookies / headers
//   • Send the response
// All business logic lives in auth.service.ts

export const authController = {
  // POST /auth/register
  register: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body as RegisterInput);
    ApiResponse.created(res, null, result.message);
  }),

  // POST /auth/login
  login: catchAsync(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body as LoginInput);

    // Refresh token → httpOnly cookie
    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    ApiResponse.success(res, {
      user,
      accessToken: tokens.accessToken,
    });
  }),

  // POST /auth/refresh
  refresh: catchAsync(async (req: Request, res: Response) => {
    const incomingToken = req.cookies?.refreshToken as string | undefined;

    if (!incomingToken) {
      throw ApiError.unauthorized("No refresh token provided");
    }

    const tokens = await authService.refreshTokens(incomingToken);

    // Rotate refresh cookie
    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    ApiResponse.success(res, { accessToken: tokens.accessToken });
  }),

  // POST /auth/logout
  logout: catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (req.user && refreshToken) {
      await authService.logout(req.user._id, refreshToken);
    }

    // Clear the cookie regardless
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
    });

    ApiResponse.success(res, null, "Logged out successfully");
  }),

  // POST /auth/logout-all
  logoutAll: catchAsync(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!._id);
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    ApiResponse.success(res, null, "Logged out from all devices");
  }),

  // GET /auth/verify-email/:token
  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.verifyEmail(req.params.token);
    ApiResponse.success(res, null, result.message);
  }),

  // POST /auth/forgot-password
  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(
      req.body as ForgotPasswordInput,
    );
    ApiResponse.success(res, null, result.message);
  }),

  // POST /auth/reset-password
  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(
      req.body as ResetPasswordInput,
    );
    ApiResponse.success(res, null, result.message);
  }),

  // PATCH /auth/change-password  (protected)
  changePassword: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.changePassword(
      req.user!._id,
      req.body as ChangePasswordInput,
    );
    // Clear cookie — user must re-login
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    ApiResponse.success(res, null, result.message);
  }),

  // GET /auth/me  (protected)
  getMe: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!._id);
    ApiResponse.success(res, user);
  }),

  // POST /auth/resend-verification  (protected)
  resendVerification: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.resendVerificationEmail(req.user!._id);
    ApiResponse.success(res, null, result.message);
  }),
};
