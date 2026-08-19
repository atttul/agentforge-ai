import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../shared/ApiError";
import { StatusCodes } from "../shared/StatusCodes";

export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string = env.JWT_EXPIRES_IN
): string => {
  const secret = env.JWT_SECRET || "default_jwt_secret_agentforge";
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = env.JWT_SECRET || "default_jwt_secret_agentforge";
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
};
