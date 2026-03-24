import crypto from "crypto";
import { User } from "../../models/User.model";
import { ApiError } from "../../utils/ApiError";
import { IUserPayload } from "../../types";
import {
  generateTokenPair,
  verifyRefreshToken,
  TokenPair,
} from "./jwt.service";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from "./email.service";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "./auth.validator";

// Helpers: generate random crypto token
const generateToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString("hex");

// Generates a 6-digit numeric OTP
const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Builds the JWT payload from a user document
const buildPayload = (user: {
  _id: unknown;
  email: string;
  role: string;
  isVerified: boolean;
}): IUserPayload => ({
  _id: String(user._id),
  email: user.email,
  role: user.role as IUserPayload["role"],
  isVerified: user.isVerified,
});

// Auth Service
export const authService = {
  // register
  async register(input: RegisterInput): Promise<{ message: string }> {
    const { name, email, password } = input;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    // Generate email verification token
    const emailVerificationToken = generateToken();

    // Create user — passwordHash pre-save hook handles bcrypt
    await User.create({
      name,
      email,
      passwordHash: password,
      emailVerificationToken,
    });

    // Send verification email: non-blocking
    await sendVerificationEmail(email, name, emailVerificationToken);

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  },

  // login
  async login(input: LoginInput): Promise<{
    user: Partial<IUserPayload>;
    tokens: TokenPair;
  }> {
    const { email, password } = input;

    // Explicitly select passwordHash and refreshTokens (both select:false)
    const user = await User.findOne({ email, isActive: true }).select(
      "+passwordHash +refreshTokens",
    );

    if (!user) {
      // Use generic message to prevent user enumeration
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Update last login timestamp
    user.lastLogin = new Date();

    // Generate tokens
    const payload = buildPayload(user);
    const tokens = generateTokenPair(payload);

    // Store refresh token (support multiple devices, max 5)
    user.refreshTokens = [
      ...(user.refreshTokens ?? []).slice(-4),
      tokens.refreshToken,
    ];
    await user.save({ validateBeforeSave: false });

    return { user: payload, tokens };
  },

  // refreshTokens
  async refreshTokens(incomingRefreshToken: string): Promise<TokenPair> {
    // Verify refresh token signature first
    let decoded: { _id: string };
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    // Find user and check token is in their list (rotation check)
    const user = await User.findById(decoded._id).select("+refreshTokens");
    if (!user || !user.refreshTokens?.includes(incomingRefreshToken)) {
      // Token reuse detected — invalidate ALL tokens for this user (security)
      if (user) {
        user.refreshTokens = [];
        await user.save({ validateBeforeSave: false });
      }
      throw ApiError.unauthorized(
        "Refresh token reuse detected. Please log in again.",
      );
    }

    // Rotate: remove old token, add new one
    const payload = buildPayload(user);
    const newTokens = generateTokenPair(payload);

    user.refreshTokens = [
      ...user.refreshTokens.filter((t) => t !== incomingRefreshToken),
      newTokens.refreshToken,
    ];
    await user.save({ validateBeforeSave: false });

    return newTokens;
  },

  // logout
  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  // logoutAll
  // Invalidates all sessions (all devices)
  async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
  },

  // verifyEmail
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await User.findOne({
      emailVerificationToken: token,
    }).select("+emailVerificationToken");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired verification link");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email after verification
    await sendWelcomeEmail(user.email, user.name);

    return { message: "Email verified successfully. You can now log in." };
  },

  //  forgotPassword
  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<{ message: string }> {
    const { email } = input;
    const user = await User.findOne({ email, isActive: true });

    // Always return the same message to prevent user enumeration
    const genericMessage =
      "If an account exists with this email, you will receive an OTP shortly.";

    if (!user) return { message: genericMessage };

    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.passwordResetToken = otpHash;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, user.name, otp);

    return { message: genericMessage };
  },

  // resetPassword
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const { email, otp, newPassword } = input;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: otpHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +refreshTokens");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    // Set new password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Invalidate all sessions on password reset for security
    user.refreshTokens = [];
    await user.save();

    await sendPasswordChangedEmail(user.email, user.name);

    return {
      message:
        "Password reset successfully. Please log in with your new password.",
    };
  },

  // changePassword

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = input;

    const user = await User.findById(userId).select(
      "+passwordHash +refreshTokens",
    );
    if (!user) throw ApiError.notFound("User");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    user.passwordHash = newPassword;
    // Invalidate all other sessions except current
    user.refreshTokens = [];
    await user.save();

    await sendPasswordChangedEmail(user.email, user.name);

    return { message: "Password changed successfully. Please log in again." };
  },

  // getMe
  async getMe(userId: string) {
    const user = await User.findById(userId).select("-__v");
    if (!user) throw ApiError.notFound("User");
    return user.toPublicJSON();
  },

  //  resendVerification
  async resendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await User.findById(userId).select("+emailVerificationToken");
    if (!user) throw ApiError.notFound("User");
    if (user.isVerified) {
      throw ApiError.badRequest("Email is already verified");
    }

    const emailVerificationToken = generateToken();
    user.emailVerificationToken = emailVerificationToken;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.name, emailVerificationToken);

    return { message: "Verification email sent. Please check your inbox." };
  },
};
