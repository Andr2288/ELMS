// frontend/src/store/useFlashcardStore.js

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useFlashcardStore = create((set, get) => ({
  flashcards: [],
  isLoading: false,

  getFlashcards: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/flashcards");
      set({ flashcards: res.data });
    } catch (error) {
      console.log("Error getting flashcards:", error);
      toast.error("Failed to get flashcards");
    } finally {
      set({ isLoading: false });
    }
  },

  createFlashcard: async (flashcardData) => {
    try {
      const res = await axiosInstance.post("/flashcards", flashcardData);
      set({ flashcards: [res.data, ...get().flashcards] });
      toast.success("Flashcard created!");
      return res.data;
    } catch (error) {
      console.log("Error creating flashcard:", error);
      toast.error("Failed to create flashcard");
      throw error;
    }
  },

  updateFlashcard: async (id, flashcardData) => {
    try {
      const res = await axiosInstance.put(`/flashcards/${id}`, flashcardData);
      set({
        flashcards: get().flashcards.map((card) =>
            card._id === id ? res.data : card
        ),
      });
      toast.success("Flashcard updated!");
      return res.data;
    } catch (error) {
      console.log("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
      throw error;
    }
  },

  deleteFlashcard: async (id) => {
    try {
      await axiosInstance.delete(`/flashcards/${id}`);
      set({
        flashcards: get().flashcards.filter((card) => card._id !== id),
      });
      toast.success("Flashcard deleted!");
    } catch (error) {
      console.log("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    }
  },
}));