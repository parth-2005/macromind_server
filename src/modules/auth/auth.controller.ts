import Auth from "./auth.model.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type Request, type Response } from "express";
import { generateAccessToken, generateRefreshToken, hashToken } from "../../shared/utils/token.utils.ts";

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // create 2 tokens (access and refresh)
        const accessToken = generateAccessToken({ email });
        const refreshToken = generateRefreshToken({ email });
        const hashedRefreshToken = hashToken(refreshToken);

        const newUser = new Auth({
            email,
            password,
            refreshToken: hashedRefreshToken,
        });
        await newUser.save();

        res.status(201).json({ accessToken, refreshToken });
    } catch (error: any) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
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
        res.json({ accessToken, refreshToken: newRefreshToken });
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