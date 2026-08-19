import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info({
    requestId: req.headers["x-request-id"],
    method: req.method,
    url: req.originalUrl,
  });

  next();
};