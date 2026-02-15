import { type Request, type Response } from "express";
import mongoose from "mongoose";
import Profile from "./profile.model.ts";
import Auth from "../auth/auth.model.ts";

export const createProfile = async (req: Request, res: Response) => {
    try {
        const { name, phoneNumber, preferences, location } = req.body;

        // Validate required fields
        if (!name || !phoneNumber || !preferences || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate preferences is an array
        if (!Array.isArray(preferences)) {
            return res.status(400).json({ message: "Preferences must be an array of strings" });
        }

        // Get userId from authenticated user
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if profile for this user already exists
        const existingProfile = await Profile.findOne({ userId: userId as any });
        if (existingProfile) {
            return res.status(409).json({ message: "Profile already exists for this user" });
        }

        const profile = new Profile({
            userId: userId as any,
            name,
            phoneNumber,
            preferences,
            location,
        });

        await profile.save();
        res.status(201).json(profile);
    } catch (error: any) {
        console.error("Error creating profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getCurrentUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const profile = await Profile.findOne({ userId: userId as any });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Fetch email from Auth model
        const auth = await Auth.findById(userId);
        const email = auth?.email || '';

        // Return profile with email included
        const profileData = profile.toObject() as any;
        res.json({
            _id: profileData._id,
            userId: profileData.userId,
            name: profileData.name,
            phoneNumber: profileData.phoneNumber,
            email: email,
            preferences: profileData.preferences,
            location: profileData.location,
            createdAt: profileData.createdAt,
            updatedAt: profileData.updatedAt,
        });
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findById(id);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile);
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getAllProfiles = async (req: Request, res: Response) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (error: any) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, preferences, location } = req.body;

        // Build update object with only provided fields
        const updateData: any = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (preferences) updateData.preferences = preferences;
        if (location) updateData.location = location;

        const profile = await Profile.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByIdAndDelete(id);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ message: "Profile deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting profile:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};