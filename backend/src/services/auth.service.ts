import { HTTP_STATUS } from "../constants/http-status";
import { UserModel, type UserDocument } from "../models/user.model";
import type { LoginResult, SafeUser } from "../types/auth";
import { AppError } from "../utils/app-error";
import { signAuthToken } from "../utils/jwt";
import type { LoginInput } from "../validators/auth.validator";

const toSafeUser = (user: UserDocument): SafeUser => ({
  email: user.email,
  id: user.id,
  name: user.name,
  role: user.role,
  status: user.status,
});

export const loginUser = async (credentials: LoginInput): Promise<LoginResult> => {
  const user = await UserModel.findOne({ email: credentials.email }).select("+password").exec();

  if (!user) {
    throw new AppError("Invalid email or password.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("User account is inactive.", HTTP_STATUS.FORBIDDEN);
  }

  const isPasswordValid = await user.comparePassword(credentials.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", HTTP_STATUS.UNAUTHORIZED);
  }

  const token = signAuthToken({
    email: user.email,
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: toSafeUser(user),
  };
};

export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await UserModel.findById(userId).exec();

  if (!user) {
    throw new AppError("Authenticated user no longer exists.", HTTP_STATUS.UNAUTHORIZED);
  }

  return toSafeUser(user);
};
