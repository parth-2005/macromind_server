import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import Auth from "../../modules/auth/auth.model.ts";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                userId: string;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { email: string };

        // Find user to get userId
        const user = await Auth.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Attach user info to request
        req.user = {
            email: decoded.email,
            userId: user._id.toString(),
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
