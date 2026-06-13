import { env } from "./env";

export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
} as const;

export const REDIS_CONFIG = {
  HOST: env.REDIS_URL || env.REDIS_HOST || "localhost",
  PORT: env.REDIS_PORT || 6379,
} as const;