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

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select("+password");
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.exists({ email });
    return !!user;
  }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }
}

export const userRepository = new UserRepository();