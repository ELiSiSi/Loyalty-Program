import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/loyalty_saas'),
  
  JWT_ACCESS_SECRET: z.string().default('enterprise_loyalty_super_secret_access_jwt_key_2026'),
  JWT_REFRESH_SECRET: z.string().default('enterprise_loyalty_super_secret_refresh_jwt_key_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_COOKIE_EXPIRES_IN: z.string().default('90').transform(Number),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Email Config
  RESEND_API_KEY: z.string().optional(),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().default('587').transform(Number),
  MY_EMAIL_USERNAME: z.string().optional(),
  MY_EMAIL_PASSWORD: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('200').transform(Number),
  RATE_LIMIT_TIMEWINDOW: z.string().default('60000').transform(Number), // 1 minute in ms
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
