import { Router } from "express";

import { search } from "../controllers/search.controller";
import { authenticate, authorize, PERMISSIONS } from "../middlewares/auth.middleware";

export const searchRouter = Router();

searchRouter.use(authenticate);

searchRouter.get("/", authorize(PERMISSIONS.SEARCH_EMPLOYEES), search);
