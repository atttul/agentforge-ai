import { NextFunction, Request, Response } from "express";
import { ApiError } from "../shared/ApiError";
import { ApiResponse } from "../shared/ApiResponse";
import { StatusCodes } from "../shared/StatusCodes";
import { logger } from "../config/logger";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(new ApiResponse(false, err.message, err.errors));
    return;
  }

  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(new ApiResponse(false, "Internal Server Error"));
};