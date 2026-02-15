import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type Response } from "express";

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
        expiresIn: "1m",
    });
};

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
        expiresIn: "7d",
    });
};

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
