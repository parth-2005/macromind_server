// src/server.ts
import app from './app.ts';
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./shared/config/db.ts";

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
