// backend/src/models/flashcard.model.js

import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        transcription: {
            type: String,
            default: "",
            trim: true,
        },
        translation: {
            type: String,
            default: "",
            trim: true,
        },
        explanation: {
            type: String,
            default: "",
            trim: true,
        },
        example: {
            type: String,
            default: "",
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null, // null means no category (uncategorized)
        },
    },
    {
        timestamps: true,
    }
);

// Index for better performance
flashcardSchema.index({ userId: 1, categoryId: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;