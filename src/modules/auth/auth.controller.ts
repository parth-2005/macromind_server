import Auth from "./auth.model.ts";
import Profile from "../profile/profile.model.ts"; // Import Profile model for atomic registration
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type Request, type Response } from "express";
import { generateAccessToken, generateRefreshToken, hashToken } from "../../shared/utils/token.utils.ts";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
    try {
        // 1. Destructure ALL data
        const {
            email,
            password,
            name,
            phoneNumber,
            preferences,
            location
        } = req.body;

        // 2. Validation
        if (!email || !password || !name || !phoneNumber || !preferences || !location) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 3. Check for existing user
        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // 4. Create Auth User
        const accessToken = generateAccessToken({ email });
        const refreshToken = generateRefreshToken({ email });
        const hashedRefreshToken = hashToken(refreshToken);

        const newUser = new Auth({
            email,
            password,
            refreshToken: hashedRefreshToken,
        });

        // SAVE STEP 1: Save the User Account
        const savedUser = await newUser.save();

        // 5. Create Linked Profile immediately
        try {
            const newProfile = new Profile({
                userId: savedUser._id,
                name,
                phoneNumber,
                preferences,
                location
            });

            // SAVE STEP 2: Save the Profile
            await newProfile.save();

        } catch (profileError) {
            // MANUAL ROLLBACK: 
            // If Profile creation fails, delete the User we just created.
            // This prevents "Ghost Users" (Auth without Profile).
            console.error("Profile creation failed, rolling back User:", profileError);
            await Auth.findByIdAndDelete(savedUser._id);
            throw profileError; // Re-throw to hit the main catch block
        }

        // 6. Return Success
        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                email: savedUser.email,
                name: name,
                isProfileComplete: true
            }
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Registration failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // create 2 tokens (access and refresh)
        const accessToken = generateAccessToken({ email });
        const newRefreshToken = generateRefreshToken({ email });
        const hashedRefreshToken = hashToken(newRefreshToken);

        // store refresh token in db
        await Auth.findOneAndUpdate({ email }, { refreshToken: hashedRefreshToken });

        // NEW: Check Profile Status for self-healing
        const userProfile = await Profile.findOne({ userId: user._id as any });

        // Return status to frontend
        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            onboardingStatus: userProfile ? "COMPLETE" : "INCOMPLETE_PROFILE",
            user: userProfile ? {
                email: user.email,
                name: userProfile.name,
                isProfileComplete: true
            } : {
                email: user.email,
                isProfileComplete: false
            }
        });

        // Frontend Logic:
        // If "COMPLETE" -> Go to Swipe Deck
        // If "INCOMPLETE_PROFILE" -> Go to "Finish Setup" Screen

    } catch (error: any) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        // Ideally we get email from the authenticated user middleware if attached, 
        // but for now relying on body is okay if client sends it, 
        // strictly speaking we should use req.user from middleware.
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        await Auth.findOneAndUpdate({ email }, { refreshToken: null });
        res.json({ message: "Logged out successfully" });
    } catch (error: any) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        // Verify token first
        let payload: any;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret");
        } catch (error) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const email = payload.email;
        const user = await Auth.findOne({ email });

        if (!user || !user.refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token request" });
        }

        const hashedIncomingToken = hashToken(refreshToken);
        if (hashedIncomingToken !== user.refreshToken) {
            // Token reuse detection block could go here
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // rotate tokens
        const newAccessToken = generateAccessToken({ email });
        const newRefreshToken = generateRefreshToken({ email });
        const newHashedRefreshToken = hashToken(newRefreshToken);

        // store refresh token in db
        await Auth.findOneAndUpdate({ email }, { refreshToken: newHashedRefreshToken });

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error: any) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};