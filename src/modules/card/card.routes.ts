import { Router } from "express";
import { getCards, createCard } from "./card.controller.ts";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.ts";

const router = Router();

router.get("/", authMiddleware, getCards);
router.post("/", authMiddleware, createCard);

export default router;