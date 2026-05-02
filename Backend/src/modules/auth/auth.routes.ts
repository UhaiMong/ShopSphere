import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validator';

const router = Router();

// Strict Rate Limiters

const loginLimiter = rateLimit({
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

const forgotPasswordLimiter = rateLimit({
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
router.post('/register', validate(registerSchema), authController.register);
// Login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
// Refresh
router.post('/refresh', authController.refresh);
// Verify email
router.get('/verify-email/:token', authController.verifyEmail);
// Forgot password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
// Reset password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected Routes
router.use(protect);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.patch('/change-password', validate(changePasswordSchema), authController.changePassword);
router.post('/resend-verification', authController.resendVerification);

export default router;
