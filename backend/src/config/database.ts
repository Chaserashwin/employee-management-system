import mongoose from "mongoose";

import { env } from "./env";
import { serializeError } from "../utils/error";
import { logger } from "../utils/logger";

const MONGODB_SERVER_SELECTION_TIMEOUT_MS = 5000;
const MONGODB_SOCKET_TIMEOUT_MS = 10000;

mongoose.set("bufferCommands", false);

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

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: MONGODB_SOCKET_TIMEOUT_MS,
    });
    logger.info("MongoDB connection established.");
  } catch (error) {
    logger.error("MongoDB connection failed.", serializeError(error));

    if (env.nodeEnv === "production") {
      throw error;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info("MongoDB connection closed.");
};
