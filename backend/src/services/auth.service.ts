import { HTTP_STATUS } from "../constants/http-status";
import { UserModel, type UserDocument } from "../models/user.model";
import type { LoginResult, SafeUser } from "../types/auth";
import { AppError } from "../utils/app-error";
import { isDatabaseConnectionError } from "../utils/database-error";
import { signAuthToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import type { LoginInput } from "../validators/auth.validator";

const toSafeUser = (user: UserDocument): SafeUser => ({
  email: user.email,
  id: user.id,
  name: user.name,
  role: user.role,
  status: user.status,
});

export const loginUser = async (credentials: LoginInput): Promise<LoginResult> => {
  let user: UserDocument | null;

  try {
    user = await UserModel.findOne({ email: credentials.email }).select("+password").exec();
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      logger.error("Login failed because MongoDB is unavailable.", {
        email: credentials.email,
        error: error instanceof Error ? { message: error.message, name: error.name } : error,
      });
    }

    throw error;
  }

  if (!user) {
    logger.warn("Login failed: user not found.", { email: credentials.email });
    throw new AppError("Invalid email or password.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.status !== "ACTIVE") {
    logger.warn("Login failed: inactive user.", { email: credentials.email });
    throw new AppError("User account is inactive.", HTTP_STATUS.FORBIDDEN);
  }

  const isPasswordValid = await user.comparePassword(credentials.password);

  if (!isPasswordValid) {
    logger.warn("Login failed: invalid password.", { email: credentials.email });
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
