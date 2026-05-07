"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Reusable field definitions
const emailField = zod_1.z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email")
    .toLowerCase()
    .trim();
const passwordField = zod_1.z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number");
const nameField = zod_1.z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters")
    .trim();
// Schemas
exports.registerSchema = zod_1.z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
});
exports.loginSchema = zod_1.z.object({
    email: emailField,
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: emailField,
});
exports.resetPasswordSchema = zod_1.z.object({
    email: emailField,
    otp: zod_1.z
        .string({ required_error: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
    newPassword: passwordField,
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string({ required_error: "Current password is required" })
        .min(1),
    newPassword: passwordField,
});
exports.updateProfileSchema = zod_1.z.object({
    name: nameField.optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[\d\s\-()]{7,15}$/, "Invalid phone number")
        .optional(),
});
//# sourceMappingURL=auth.validator.js.map