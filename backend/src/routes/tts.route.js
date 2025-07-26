// backend/src/routes/tts.route.js

import express from "express";

import ttsController from "../controllers/tts.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/speech", authMiddleware.protectRoute, ttsController.generateSpeech);

// Test endpoint for API key validation
router.get("/test", authMiddleware.protectRoute, ttsController.testApiKey);

// Test endpoint specifically for TTS functionality
router.get("/test-tts", authMiddleware.protectRoute, ttsController.testTTS);

// Check available models
router.get("/models", authMiddleware.protectRoute, ttsController.checkAvailableModels);

export default router;