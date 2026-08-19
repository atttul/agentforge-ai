import { Response } from "express";
import { ApiResponse } from "../shared/ApiResponse";
import { StatusCodes } from "../shared/StatusCodes";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = StatusCodes.OK
): Response => {
  return res
    .status(statusCode)
    .json(new ApiResponse<T>(true, message, data));
};

export const sendError = (
  res: Response,
  message: string,
  errors: unknown[] = [],
  statusCode: number = StatusCodes.BAD_REQUEST
): Response => {
  return res
    .status(statusCode)
    .json(new ApiResponse(false, message, errors));
};
