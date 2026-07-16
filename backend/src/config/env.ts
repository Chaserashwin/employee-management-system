import "dotenv/config";

type NodeEnvironment = "development" | "production" | "test";

const DEFAULT_PORT = 5000;
const NODE_ENVIRONMENTS = ["development", "production", "test"] as const;

const normalizeOptionalValue = (value: string | undefined) => {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
};

const parseNodeEnvironment = (value: string | undefined): NodeEnvironment => {
  if (!value) {
    return "development";
  }

  if (NODE_ENVIRONMENTS.includes(value as NodeEnvironment)) {
    return value as NodeEnvironment;
  }

  throw new Error(`Invalid NODE_ENV value: ${value}`);
};

const parsePort = (value: string | undefined) => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return port;
};

const parseCorsOrigins = (value: string | undefined) => {
  const normalizedValue = normalizeOptionalValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  return normalizedValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = Object.freeze({
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  jwtSecret: normalizeOptionalValue(process.env.JWT_SECRET),
  mongodbUri: normalizeOptionalValue(process.env.MONGODB_URI),
  nodeEnv: parseNodeEnvironment(process.env.NODE_ENV),
  port: parsePort(process.env.PORT),
});
