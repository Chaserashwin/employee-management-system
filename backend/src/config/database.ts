import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  if (!env.mongodbUri) {
    if (env.nodeEnv === "production") {
      throw new Error("MONGODB_URI is required in production.");
    }

    logger.warn("MONGODB_URI is not configured. Skipping MongoDB connection.");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(env.mongodbUri);
  logger.info("MongoDB connection established.");
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info("MongoDB connection closed.");
};
