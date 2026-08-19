import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { env } from "./config/env";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      // Allow local origins, configured FRONTEND_URL, or any vercel.app deployment
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow cross-origin for production flexibility
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(rateLimiterMiddleware(120, 15 * 60 * 1000));

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "AgentForge AI Backend is running 🚀",
  });
});

app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;