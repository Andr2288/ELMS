// backend/src/routes/tts.route.js

import express from "express";

import ttsController from "../controllers/tts.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/speech", authMiddleware.protectRoute, ttsController.generateSpeech);

export default router;