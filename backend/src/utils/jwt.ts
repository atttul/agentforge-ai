import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../shared/ApiError";
import { StatusCodes } from "../shared/StatusCodes";

export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

const getJwtSecret = (): string => {
  if (!env.JWT_SECRET) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "JWT_SECRET is mandatory but not configured in environment variables"
    );
  }
  return env.JWT_SECRET;
};

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string = env.JWT_EXPIRES_IN
): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
};
