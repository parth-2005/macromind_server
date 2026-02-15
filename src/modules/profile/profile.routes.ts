import { Router } from "express";
import { createProfile, getProfile, getAllProfiles, updateProfile, deleteProfile, getCurrentUserProfile } from "./profile.controller.ts";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.ts";

const router = Router();

router.post("/", authMiddleware, createProfile);
router.get("/me", authMiddleware, getCurrentUserProfile); // Get current user's profile
router.get("/:id", authMiddleware, getProfile);
router.put("/:id", authMiddleware, updateProfile);
router.delete("/:id", authMiddleware, deleteProfile);
router.get("/", authMiddleware, getAllProfiles);

export default router;
