import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validator";

const router = Router();

// ─── Strict Rate Limiters ─────────────────────────────────────────────────────
// Applied only to sensitive endpoints on top of the global limiter

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", validate(registerSchema), authController.register);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  authController.login,
);
router.post("/refresh", authController.refresh);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.use(protect); // All routes below require authentication

router.get("/me", authController.getMe);
router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAll);
router.patch(
  "/change-password",
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post("/resend-verification", authController.resendVerification);

export default router;
