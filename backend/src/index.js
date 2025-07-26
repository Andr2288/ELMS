// backend/src/index.js

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import flashcardRoutes from "./routes/flashcard.route.js";
import ttsRoutes from "./routes/tts.route.js";
import database from "./lib/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced logging for environment
console.log("Environment variables check:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
console.log("- OPENAI_API_KEY:", process.env.OPENAI_API_KEY ?
    `Set (starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : "Not set");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");

// Middleware
app.use(express.json({ limit: '10mb' })); // Увеличиваем лимит для аудио
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/tts", ttsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        features: {
            mongodb: process.env.MONGODB_URI ? "configured" : "not configured",
            openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
            jwt: process.env.JWT_SECRET ? "configured" : "not configured"
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(500).json({
            message: err.message,
            stack: err.stack
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    database.connectDB();
});