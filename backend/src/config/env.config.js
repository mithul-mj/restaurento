import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let nodeEnv = process.env.nodeEnv;
if (!nodeEnv) {
  // nodeEnv = "development";
  nodeEnv = "production";
  process.env.NODE_ENV = nodeEnv;
}

const envFileMap = {
  development: ".env.development",
  production: ".env.production",
};

const envFile = envFileMap[nodeEnv];
const envPath = path.resolve(__dirname, "../../", envFile);
dotenv.config({ path: envPath });

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  REDIS_PASSWORD: z.string().default(""),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_FORGOT_PASSWORD_SECRET: z
    .string()
    .min(1, "JWT_FORGOT_PASSWORD_SECRET is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_FORGOT_PASSWORD_TOKEN_EXPIRE: z
    .string()
    .min(1, "JWT_FORGOT_PASSWORD_TOKEN_EXPIRE is required"),
  JWT_ACCESS_TOKEN_EXPIRE: z
    .string()
    .min(1, "JWT_ACCESS_TOKEN_EXPIRE is required"),
  JWT_REFRESH_TOKEN_EXPIRE: z
    .string()
    .min(1, "JWT_REFRESH_TOKEN_EXPIRE is required"),
  ACCESS_TOKEN_MAX_AGE: z.coerce
    .number()
    .min(1, "ACCESS_TOKEN_MAX_AGE is required (in milliseconds)"),

  REFRESH_TOKEN_MAX_AGE: z.coerce
    .number()
    .min(1, "REFRESH_TOKEN_MAX_AGE is required (in milliseconds)"),

  DEFAULT_ADMIN_EMAIL: z.string().min(1, "DEFAULT_ADMIN_EMAIL is required"),
  DEFAULT_ADMIN_PASSWORD: z
    .string()
    .min(1, "DEFAULT_ADMIN_PASSWORD is required"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL is required"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  SENDER_EMAIL: z.string().min(1, "SENDER_EMAIL is required"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  // GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  // CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),

  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),

  QR_CODE_SECRET: z.string().min(1, "QR_CODE_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  const errors = parsed.error.issues || parsed.error.errors || [];
  errors.forEach((err) => {
    console.error(` - ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
