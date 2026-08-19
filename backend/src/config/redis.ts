import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) {
            logger.warn("Redis connection attempts exhausted. Operating without Redis cache.");
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redisClient.on("connect", () => {
        logger.info("✅ Redis connected successfully.");
      });

      redisClient.on("error", (err) => {
        logger.warn(`Redis connection error: ${err.message}`);
      });
    } catch (err) {
      logger.warn("Redis initialization skipped or failed.");
      redisClient = null;
    }
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (client) {
    try {
      await client.connect();
    } catch (err: any) {
      logger.warn(`Redis connection error during startup: ${err.message}`);
    }
  }
};
