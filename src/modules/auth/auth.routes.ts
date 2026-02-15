import { Router } from "express";
import { register, login, logout, refreshToken } from "./auth.controller.ts";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);

export default router;
