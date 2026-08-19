import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { userRepository } from "../repositories/auth/user.repository";
import { ApiError } from "../shared/ApiError";
import { StatusCodes } from "../shared/StatusCodes";
import { UserRole } from "../models/User";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Authentication token missing or invalid"
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User associated with this token no longer exists"
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new ApiError(StatusCodes.UNAUTHORIZED, "User not authenticated")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to perform this action"
        )
      );
    }

    next();
  };
};
