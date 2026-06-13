import Redis from "ioredis";
import { REDIS_CONFIG } from "../../Config/constants";

const redisOptions = {
  host: REDIS_CONFIG.HOST,
  port: REDIS_CONFIG.PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
};

const redis = new Redis(redisOptions);

const bullConnection = new Redis(redisOptions);

redis.on("connect", () => {
  console.log("✅ Redis app connection successful");
});

redis.on("error", () => {
  console.error("❌ Redis app connection failed");
  process.exit(1);
});

bullConnection.on("connect", () => {
  console.log("✅ Redis bull connection successful");
});

bullConnection.on("error", () => {
  console.error("❌ Bull redis connection failed");
  process.exit(1);
});

export { redis, bullConnection };