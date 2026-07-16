import { Router } from "express";

import { getTree } from "../controllers/organization.controller";
import { authenticate, authorize, PERMISSIONS } from "../middlewares/auth.middleware";

export const organizationRouter = Router();

organizationRouter.use(authenticate);

organizationRouter.get("/tree", authorize(PERMISSIONS.HIERARCHY_VIEW), getTree);
