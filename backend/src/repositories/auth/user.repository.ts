import User, { IUser } from "../../models/User";

export class UserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password");
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.exists({ email });
    return !!user;
  }
}

export const userRepository = new UserRepository();