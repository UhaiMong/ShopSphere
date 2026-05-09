"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const env_config_1 = require("../../config/env.config");
const logger_1 = require("../../utils/logger");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Transporter
let transporter;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: env_config_1.env.SMTP_HOST,
            port: env_config_1.env.SMTP_PORT,
            secure: env_config_1.env.SMTP_PORT === 465,
            auth: {
                user: env_config_1.env.SMTP_USER,
                pass: env_config_1.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};
// Base Email Template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopSphere</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a2e; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .header span { color: #7c8cf8; }
    .body { padding: 40px 32px; color: #333; }
    .body h2 { font-size: 20px; margin-top: 0; }
    .btn { display: inline-block; background: #7c8cf8; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .code { background: #f0f0f0; border-radius: 6px; padding: 16px; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; color: #1a1a2e; margin: 24px 0; }
    .note { font-size: 13px; color: #888; line-height: 1.6; }
    .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #aaa; background: #fafafa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Shop<span>Sphere</span></h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} ShopSphere. All rights reserved.<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`;
const sendMail = async (options) => {
    if (env_config_1.env.NODE_ENV === 'test')
        return; // Skip during tests
    try {
        await getTransporter().sendMail({
            from: env_config_1.env.EMAIL_FROM,
            ...options,
        });
        logger_1.logger.info(`Email sent to ${options.to}: ${options.subject}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to send email to ${options.to}:`, error);
        // Don't throw — email failure should not break the request flow
    }
};
// Email Templates
const sendVerificationEmail = async (to, name, token) => {
    const verifyUrl = `${env_config_1.env.CLIENT_URL}/verify-email/${token}`;
    await sendMail({
        to,
        subject: 'Verify your ShopSphere account',
        html: baseTemplate(`
      <h2>Welcome to ShopSphere, ${name}! 👋</h2>
      <p>Thanks for signing up. Please verify your email address to complete your registration.</p>
      <div style="text-align:center">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </div>
      <p class="note">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      <p class="note">Or copy this URL: <a href="${verifyUrl}">${verifyUrl}</a></p>
    `),
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, name, otp) => {
    await sendMail({
        to,
        subject: 'Reset your ShopSphere password',
        html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password. Use the OTP below:</p>
      <div class="code">${otp}</div>
      <p class="note">This OTP expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `),
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordChangedEmail = async (to, name) => {
    await sendMail({
        to,
        subject: 'Your ShopSphere password was changed',
        html: baseTemplate(`
      <h2>Password Changed Successfully</h2>
      <p>Hi ${name}, your password has been updated successfully.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `),
    });
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendWelcomeEmail = async (to, name) => {
    await sendMail({
        to,
        subject: 'Welcome to ShopSphere! 🛍️',
        html: baseTemplate(`
      <h2>You're all set, ${name}!</h2>
      <p>Your email has been verified. Start exploring our collection.</p>
      <div style="text-align:center">
        <a href="${env_config_1.env.CLIENT_URL}/products" class="btn">Start Shopping</a>
      </div>
    `),
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=email.service.js.map