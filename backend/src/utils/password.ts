import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  plainText: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hashed);
};
