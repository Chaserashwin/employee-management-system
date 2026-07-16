type LogLevel = "debug" | "error" | "info" | "warn";

const writeLog = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const payload = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  if (meta === undefined) {
    console[level](payload);
    return;
  }

  console[level](payload, meta);
};

export const logger = {
  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      writeLog("debug", message, meta);
    }
  },
  error(message: string, meta?: unknown) {
    writeLog("error", message, meta);
  },
  info(message: string, meta?: unknown) {
    writeLog("info", message, meta);
  },
  warn(message: string, meta?: unknown) {
    writeLog("warn", message, meta);
  },
};
