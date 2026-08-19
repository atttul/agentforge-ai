import { userRepository } from "../../repositories/auth/user.repository";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";
import { generateToken } from "../../utils/jwt";
import {
  SignupInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../../schemas/auth.schema";

export class AuthService {
  async signup(payload: SignupInput) {
    const userExists = await userRepository.existsByEmail(payload.email);

    if (userExists) {
      throw new ApiError(StatusCodes.CONFLICT, "User already exists with this email");
    }

    const user = await userRepository.createUser(payload);

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  async login(payload: LoginInput) {
    const user = await userRepository.findByEmail(payload.email);

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(payload.password);

    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Remove password before returning
    const userObject = user.toJSON();

    return {
      user: userObject,
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  }

  async updateProfile(userId: string, payload: UpdateProfileInput) {
    const user = await userRepository.updateById(userId, payload);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  }

  async changePassword(userId: string, payload: ChangePasswordInput) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const isValid = await user.comparePassword(payload.currentPassword);
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Current password is incorrect");
    }

    user.password = payload.newPassword;
    await user.save();

    return { message: "Password updated successfully" };
  }
}

export const authService = new AuthService();