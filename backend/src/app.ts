import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(helmet());
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