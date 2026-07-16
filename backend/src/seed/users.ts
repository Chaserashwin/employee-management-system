import { connectDatabase, disconnectDatabase } from "../config/database";
import { env } from "../config/env";
import { USER_ROLES } from "../constants/user";
import { UserModel } from "../models/user.model";
import { logger } from "../utils/logger";

const seedUsers = [
  {
    email: "admin@ems.com",
    name: "Super Admin",
    password: "Password123",
    role: USER_ROLES[0],
  },
  {
    email: "hr@ems.com",
    name: "HR User",
    password: "Password123",
    role: USER_ROLES[1],
  },
  {
    email: "employee@ems.com",
    name: "Employee User",
    password: "Password123",
    role: USER_ROLES[2],
  },
] as const;

const runSeed = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required to seed users.");
  }

  await connectDatabase();

  for (const seedUser of seedUsers) {
    const existingUser = await UserModel.exists({ email: seedUser.email });

    if (existingUser) {
      logger.info(`Skipping existing user ${seedUser.email}.`);
      continue;
    }

    await UserModel.create({
      ...seedUser,
      status: "ACTIVE",
    });

    logger.info(`Created seed user ${seedUser.email}.`);
  }
};

runSeed()
  .then(async () => {
    await disconnectDatabase();
    logger.info("User seeding completed.");
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error("User seeding failed.", error);
    await disconnectDatabase();
    process.exit(1);
  });
