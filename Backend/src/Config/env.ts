import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGO_DB_URI: z.string().min(1, "MongoDB URI is required"), // Safer than .url()
  API_FOOTBALL_SECRET_KEY: z
    .string()
    .min(1, "API Football secret key is required"),
  REDIS_URL: z.url().optional(), // Make optional if you use HOST/PORT
  REDIS_HOST: z.string().default("localhost"),
  // Handle string input and transform to number for the app
  REDIS_PORT: z.string().default("6379").transform(Number),

  // JWT commented out since clerk will likely be used for auth

  // JWT_ACCESS_SECRET: z
  //   .string()
  //   .min(32, "Access secret must be at least 32 chars"),
  // JWT_REFRESH_SECRET: z
  //   .string()
  //   .min(32, "Refresh secret must be at least 32 chars"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid Environment Variables:");
    // This maps through the errors and shows you EXACTLY which key is missing/wrong
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
};

export const env = validateEnv()!;
