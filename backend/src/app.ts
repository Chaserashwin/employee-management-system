import "./types/express";

import path from "node:path";

import compression from "compression";
import cors, { type CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { authRouter } from "./routes/auth.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { employeeRouter } from "./routes/employee.routes";
import { organizationRouter } from "./routes/organization.routes";
import { searchRouter } from "./routes/search.routes";

export const createApp = () => {
  const app = express();
  const uploadsPath = path.resolve(process.cwd(), "uploads");
  const corsOptions: CorsOptions = {
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    origin: env.corsOrigins ?? (env.nodeEnv === "production" ? false : true),
  };

  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    "/uploads",
    express.static(uploadsPath, {
      immutable: true,
      maxAge: "30d",
      setHeaders(response) {
        response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    }),
  );

  app.get("/health", (_request, response) => {
    response.status(200).json({
      data: {
        environment: env.nodeEnv,
        port: env.port,
        status: "ok",
      },
      message: "Backend is healthy.",
      success: true,
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/employees", employeeRouter);
  app.use("/api/organization", organizationRouter);
  app.use("/api/search", searchRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
