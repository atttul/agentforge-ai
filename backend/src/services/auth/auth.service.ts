import jwt, { SignOptions } from "jsonwebtoken";

import { userRepository } from "../../repositories/auth/user.repository";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";
import { env } from "../../config/env";

interface SignupDTO {
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async signup(payload: SignupDTO) {
    const userExists = await userRepository.existsByEmail(payload.email);

    if (userExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "User already exists"
      );
    }

    const user = await userRepository.createUser(payload);

    const token = jwt.sign(
      {
        userId: user._id,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
      }
    );

    return {
      user,
      token,
    };
  }

  async login(payload: LoginDTO) {
    const user = await userRepository.findByEmail(payload.email);

    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid credentials"
      );
    }

    const isPasswordValid = await user.comparePassword(payload.password);

    if (!isPasswordValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid credentials"
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
      }
    );

    return {
      user,
      token,
    };
  }
}

export const authService = new AuthService();