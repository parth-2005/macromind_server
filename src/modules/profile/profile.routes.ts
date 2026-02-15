import { Router } from "express";
import { createProfile, getProfile, getAllProfiles, updateProfile, deleteProfile } from "./profile.controller.ts";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.ts";

const router = Router();

router.post("/", authMiddleware, createProfile);
router.get("/:id", authMiddleware, getProfile);
router.get("/", authMiddleware, getAllProfiles);
router.put("/:id", authMiddleware, updateProfile);
router.delete("/:id", authMiddleware, deleteProfile);

export default router;
