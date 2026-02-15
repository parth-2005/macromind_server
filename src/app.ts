// src/app.ts
import express, { type Application, type Request, type Response } from 'express';
import cardRoutes from './modules/card/card.routes.ts';
import authRoutes from './modules/auth/auth.routes.ts';
import profileRoutes from './modules/profile/profile.routes.ts';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/cards", cardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

export default app;