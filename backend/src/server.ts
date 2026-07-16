import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    logger.info(`Backend server listening on port ${env.port}.`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info(`${signal} received. Closing backend server.`);

    server.close(() => {
      disconnectDatabase()
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          logger.error("Error while closing backend server.", error);
          process.exit(1);
        });
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer().catch((error: unknown) => {
  logger.error("Failed to start backend server.", error);
  process.exit(1);
});
