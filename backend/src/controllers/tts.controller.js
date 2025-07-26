// backend/src/controllers/tts.controller.js

import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache for audio files
const audioCache = new Map();

const generateSpeech = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: "OpenAI API key not configured" });
        }

        // Improved API key validation - accepting both standard and project-based keys
        if (!(process.env.OPENAI_API_KEY.startsWith('sk-'))) {
            return res.status(500).json({ message: "Invalid OpenAI API key format" });
        }

        // Create cache key from text
        const cacheKey = crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');

        // Check if audio is already cached
        if (audioCache.has(cacheKey)) {
            console.log("Using cached audio for:", text.substring(0, 50));
            const cachedAudio = audioCache.get(cacheKey);
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': cachedAudio.length,
                'Cache-Control': 'public, max-age=86400' // 24 hours
            });
            return res.send(cachedAudio);
        }

        console.log("Generating new TTS for:", text.substring(0, 50));

        // Generate speech using OpenAI TTS with correct parameters
        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts", // Базова модель TTS
            voice: "ash", // Стандартний голос
            input: text.substring(0, 4096), // Обмежуємо довжину тексту
            speed: 0.9, // Повільніше для навчання
            response_format: "mp3" // Явно вказуємо формат
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Cache the audio (limit cache size to prevent memory issues)
        if (audioCache.size < 100) {
            audioCache.set(cacheKey, buffer);
            console.log("Audio cached. Cache size:", audioCache.size);
        } else {
            console.log("Cache limit reached, not caching this audio");
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'public, max-age=86400' // 24 hours
        });

        return res.send(buffer);

    } catch (error) {
        console.log("Error in generateSpeech controller:", error.message);
        console.log("Error details:", error);

        // More detailed error handling
        if (error.status === 401 || error.message?.includes('Incorrect API key')) {
            console.log("API Key issue detected. Current key starts with:",
                process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
            return res.status(401).json({
                message: "Invalid OpenAI API key. Please check your API key in .env file",
                details: "API key may be expired, invalid, or have insufficient permissions"
            });
        }

        if (error.status === 429 || error.message?.includes('rate limit')) {
            return res.status(429).json({
                message: "OpenAI API rate limit exceeded. Please try again later",
                details: "Too many requests to OpenAI API"
            });
        }

        if (error.status === 402 || error.message?.includes('quota')) {
            return res.status(402).json({
                message: "OpenAI API quota exceeded. Please check your billing",
                details: "Insufficient credits or billing issue"
            });
        }

        if (error.status === 400) {
            return res.status(400).json({
                message: "Invalid request to OpenAI API",
                details: error.message
            });
        }

        // Network or other errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "Cannot connect to OpenAI API. Please check your internet connection",
                details: "Network connectivity issue"
            });
        }

        // Generic error
        return res.status(500).json({
            message: "Error generating speech",
            details: "Internal server error occurred while generating speech"
        });
    }
};

// Utility function to test API key with a simple completion
const testApiKey = async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: "OpenAI API key not configured" });
        }

        console.log("Testing API key:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");

        // Test with a simple chat completion
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'API key works'" }],
            max_tokens: 5
        });

        console.log("API test successful:", response.choices[0].message.content);

        return res.status(200).json({
            message: "API key is valid",
            test_response: response.choices[0].message.content
        });
    } catch (error) {
        console.log("API Key test failed:", error.message);
        console.log("Full error:", error);

        // Enhanced error details
        let errorDetails = {
            message: "Invalid API key",
            error: error.message
        };

        // Add more context if available
        if (error.response) {
            errorDetails.status = error.response.status;
            errorDetails.data = error.response.data;
        }

        return res.status(401).json(errorDetails);
    }
};

// Utility function to test TTS specifically
const testTTS = async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: "OpenAI API key not configured" });
        }

        console.log("Testing TTS functionality with API key:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");

        // Test with a simple TTS request
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: "Test",
            response_format: "mp3"
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        console.log("TTS test successful. Audio size:", buffer.length);

        return res.status(200).json({
            message: "TTS API works correctly",
            audio_size: buffer.length
        });
    } catch (error) {
        console.log("TTS test failed:", error.message);
        console.log("Full error:", error);

        // Enhanced error details
        let errorDetails = {
            message: "TTS test failed",
            error: error.message
        };

        if (error.response) {
            errorDetails.status = error.response.status;
            errorDetails.data = error.response.data;
        }

        return res.status(error.status || 500).json(errorDetails);
    }
};

// Function to check available models - updated for OpenAI API v5+
const checkAvailableModels = async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: "OpenAI API key not configured" });
        }

        console.log("Checking available models with API key:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");

        // In OpenAI API v5+, the models API returns data differently
        const modelsResponse = await openai.models.list();

        // Log full response for debugging
        console.log("Models API response:", JSON.stringify(modelsResponse).substring(0, 200) + "...");

        // Extract model data - handle both newer and older API formats
        const models = Array.isArray(modelsResponse.data)
            ? modelsResponse.data
            : (modelsResponse.data?.data || modelsResponse);

        if (!Array.isArray(models)) {
            console.log("Unexpected models format:", models);
            return res.status(200).json({
                message: "Models retrieved but in unexpected format",
                raw_response: modelsResponse
            });
        }

        // Filter for TTS models
        const ttsModels = models.filter(model => {
            const id = typeof model === 'string' ? model : model.id;
            return id && (
                id.includes('tts') ||
                id.includes('speech') ||
                id === 'tts-1' ||
                id === 'tts-1-hd'
            );
        });

        const modelIds = models.map(m => typeof m === 'string' ? m : m.id);

        return res.status(200).json({
            message: "Models retrieved successfully",
            total_models: models.length,
            tts_models: ttsModels.map(m => typeof m === 'string' ? m : m.id),
            all_models: modelIds.slice(0, 10) // показуємо перші 10
        });
    } catch (error) {
        console.log("Models check failed:", error.message);
        console.log("Full error:", error);

        // Enhanced error details
        let errorDetails = {
            message: "Failed to get models",
            error: error.message
        };

        if (error.response) {
            errorDetails.status = error.response.status;
            errorDetails.data = error.response.data;
        }

        return res.status(error.status || 500).json(errorDetails);
    }
};

export default {
    generateSpeech,
    testApiKey,
    testTTS,
    checkAvailableModels,
};