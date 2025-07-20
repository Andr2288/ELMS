// backend/src/controllers/flashcard.controller.js

import Flashcard from "../models/flashcard.model.js";

const createFlashcard = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const newFlashcard = new Flashcard({
      text: text.trim(),
      userId,
    });

    await newFlashcard.save();

    return res.status(201).json(newFlashcard);
  } catch (error) {
    console.log("Error in createFlashcard controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const userId = req.user._id;

    const flashcards = await Flashcard.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json(flashcards);
  } catch (error) {
    console.log("Error in getFlashcards controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const flashcard = await Flashcard.findOne({ _id: id, userId });

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    flashcard.text = text.trim();
    await flashcard.save();

    return res.status(200).json(flashcard);
  } catch (error) {
    console.log("Error in updateFlashcard controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const flashcard = await Flashcard.findOneAndDelete({ _id: id, userId });

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    return res.status(200).json({ message: "Flashcard deleted" });
  } catch (error) {
    console.log("Error in deleteFlashcard controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
};
