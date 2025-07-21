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

        // Create cache key from text
        const cacheKey = crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');

        // Check if audio is already cached
        if (audioCache.has(cacheKey)) {
            const cachedAudio = audioCache.get(cacheKey);
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': cachedAudio.length,
                'Cache-Control': 'public, max-age=86400' // 24 hours
            });
            return res.send(cachedAudio);
        }

        // Generate speech using OpenAI TTS
        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "ash",
            input: text,
            speed: 0.9, // Slightly slower for learning
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Cache the audio (limit cache size to prevent memory issues)
        if (audioCache.size < 100) {
            audioCache.set(cacheKey, buffer);
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'public, max-age=86400' // 24 hours
        });

        return res.send(buffer);

    } catch (error) {
        console.log("Error in generateSpeech controller", error.message);

        // Check if it's an OpenAI API error
        if (error.status === 401) {
            return res.status(401).json({ message: "Invalid OpenAI API key" });
        }

        if (error.status === 429) {
            return res.status(429).json({ message: "OpenAI API rate limit exceeded" });
        }

        return res.status(500).json({ message: "Error generating speech" });
    }
};

export default {
    generateSpeech,
};