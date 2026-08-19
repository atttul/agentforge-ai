import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../config/redis";
import { ApiError } from "../shared/ApiError";
import { StatusCodes } from "../shared/StatusCodes";

// Simple in-memory fallback rate-limiting store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimiterMiddleware = (limit: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `ratelimit:${ip}`;
    const redis = getRedisClient();

    if (redis && redis.status === "ready") {
      try {
        const requests = await redis.incr(key);
        if (requests === 1) {
          await redis.pexpire(key, windowMs);
        }

        if (requests > limit) {
          throw new ApiError(
            StatusCodes.TOO_MANY_REQUESTS,
            "Too many requests, please try again later."
          );
        }

        return next();
      } catch (err) {
        if (err instanceof ApiError) return next(err);
        // Fallback to in-memory if Redis error occurs
      }
    }

    // In-memory rate limiting fallback
    const now = Date.now();
    const record = memoryStore.get(ip);

    if (!record || now > record.resetTime) {
      memoryStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > limit) {
      return next(
        new ApiError(
          StatusCodes.TOO_MANY_REQUESTS,
          "Too many requests, please try again later."
        )
      );
    }

    next();
  };
};
