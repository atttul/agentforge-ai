import { NextFunction, Request, Response } from "express";
import { ApiError } from "../shared/ApiError";
import { ApiResponse } from "../shared/ApiResponse";
import { StatusCodes } from "../shared/StatusCodes";
import { logger } from "../config/logger";

export const errorMiddleware = (
  err: any,
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

  // 1. Direct ApiError instance
  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(new ApiResponse(false, err.message, err.errors));
    return;
  }

  // 2. Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, `Invalid format for field: ${err.path}`));
    return;
  }

  // 3. Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {}).join(", ");
    res
      .status(StatusCodes.CONFLICT)
      .json(new ApiResponse(false, `Duplicate value for field: ${keys || "resource"}`));
    return;
  }

  // 4. JWT Token Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new ApiResponse(false, "Invalid or expired token"));
    return;
  }

  // 5. Default fallback for unhandled internal server errors
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json(new ApiResponse(false, "Internal Server Error"));
};