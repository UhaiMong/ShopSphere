"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from project root
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
// Zod Schema
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().default('5000').transform(Number),
    // Database
    MONGO_URI: zod_1.z.string().min(1, 'MONGO_URI is required'),
    // JWT
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRE: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRE: zod_1.z.string().default('7d'),
    // Client
    CLIENT_URL: zod_1.z.string().url().default('http://localhost:3000'),
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
    // Nodemailer
    SMTP_HOST: zod_1.z.string().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().default('587').transform(Number),
    SMTP_USER: zod_1.z.string().email(),
    SMTP_PASS: zod_1.z.string().min(1, 'SMTP_PASS is required'),
    EMAIL_FROM: zod_1.z.string().min(1, 'EMAIL_FROM is required'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000').transform(Number),
    RATE_LIMIT_MAX: zod_1.z.string().default('100').transform(Number),
});
// Validate
const _parsed = envSchema.safeParse(process.env);
if (!_parsed.success) {
    console.error('Invalid environment variables:');
    _parsed.error.issues.forEach((issue) => {
        console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
}
exports.env = _parsed.data;
//# sourceMappingURL=env.config.js.map