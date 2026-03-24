import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Zod Schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("5000").transform(Number),

  // Database
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRE: z.string().default("15m"),
  JWT_REFRESH_EXPIRE: z.string().default("7d"),

  // Client
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Nodemailer
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587").transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX: z.string().default("100").transform(Number),
});

// Validate
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("Invalid environment variables:");
  _parsed.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = _parsed.data;
export type Env = typeof env;
