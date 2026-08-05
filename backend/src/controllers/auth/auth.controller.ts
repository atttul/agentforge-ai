import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../../shared/StatusCodes";
import { ApiResponse } from "../../shared/ApiResponse";
import { authService } from "../../services/auth/auth.service";

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);

      res.status(StatusCodes.CREATED).json(
        new ApiResponse(true, "User registered successfully", result)
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.status(StatusCodes.OK).json(
        new ApiResponse(true, "Login successful", result)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();