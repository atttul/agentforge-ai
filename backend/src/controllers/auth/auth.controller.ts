import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../../shared/StatusCodes";
import { authService } from "../../services/auth/auth.service";
import { sendSuccess } from "../../utils/response";

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      sendSuccess(res, "User registered successfully", result, StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, "Login successful", result, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!._id.toString());
      sendSuccess(res, "User profile retrieved", user, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!._id.toString(), req.body);
      sendSuccess(res, "Profile updated successfully", user, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.user!._id.toString(), req.body);
      sendSuccess(res, result.message, null, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();