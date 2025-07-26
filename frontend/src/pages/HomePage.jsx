// frontend/src/pages/HomePage.jsx

import { useState, useEffect } from "react";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import { Plus, Edit, Trash2, BookOpen, Grid3X3, Eye } from "lucide-react";
import DetailedFlashcardView from "../components/DetailedFlashcardView.jsx";
import FlashcardForm from "../components/FlashcardForm.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";

const HomePage = () => {
    const { flashcards, isLoading, getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } = useFlashcardStore();
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "detailed"
    const [editingCard, setEditingCard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getFlashcards();
    }, [getFlashcards]);

    const handleCreateSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await createFlashcard(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (formData) => {
        if (!editingCard) return;

        setIsSubmitting(true);
        try {
            await updateFlashcard(editingCard._id, formData);
            setEditingCard(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (card) => {
        setEditingCard(card);
        setShowForm(true);
    };

    const handleDeleteClick = (card) => {
        setCardToDelete(card);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!cardToDelete) return;

        setIsDeleting(true);
        try {
            await deleteFlashcard(cardToDelete._id);
            setShowDeleteModal(false);
            setCardToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setCardToDelete(null);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCard(null);
    };

    if (isLoading) {
        return (
            <div className="ml-64 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Завантаження...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ml-64 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Мої флеш картки</h1>
                            <p className="text-gray-600 mt-1">Керуйте своїми картками для вивчення</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    <span>Сітка</span>
                                </button>
                                <button
                                    onClick={() => setViewMode("detailed")}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                        viewMode === "detailed"
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Детально</span>
                                </button>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Нова картка</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {flashcards.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <BookOpen className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Немає карток</h3>
                        <p className="text-gray-600">Створіть свою першу флеш картку для початку вивчення</p>
                    </div>
                ) : (
                    <>
                        {viewMode === "detailed" ? (
                            <DetailedFlashcardView
                                flashcards={flashcards}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {flashcards.map((card) => (
                                    <div key={card._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">
                                                    {card.text}
                                                </h3>

                                                {card.transcription && (
                                                    <p className="text-sm text-gray-600 font-mono mb-2">
                                                        [{card.transcription}]
                                                    </p>
                                                )}

                                                {card.translation && (
                                                    <p className="text-blue-600 font-medium mb-2">
                                                        {card.translation}
                                                    </p>
                                                )}

                                                {card.explanation && (
                                                    <p className="text-gray-700 text-sm line-clamp-2">
                                                        {card.explanation}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(card.createdAt).toLocaleDateString('uk-UA')}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(card)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(card)}
                                                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            <FlashcardForm
                isOpen={showForm}
                onClose={closeForm}
                onSubmit={editingCard ? handleEditSubmit : handleCreateSubmit}
                editingCard={editingCard}
                isLoading={isSubmitting}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                cardText={cardToDelete?.text}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default HomePage;