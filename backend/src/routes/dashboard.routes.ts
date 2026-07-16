import { Router } from "express";

import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate, authorize, PERMISSIONS } from "../middlewares/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/", authorize(PERMISSIONS.DASHBOARD_VIEW), getDashboard);
