import { Router } from "express";

import { login, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, me);
