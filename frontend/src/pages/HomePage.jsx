// frontend/src/pages/HomePage.jsx

import { useState, useEffect } from "react";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import { useCategoryStore } from "../store/useCategoryStore.js";
import { Plus, Edit, Trash2, BookOpen, Grid3X3, Eye, Folder, ArrowLeft } from "lucide-react";
import DetailedFlashcardView from "../components/DetailedFlashcardView.jsx";
import FlashcardForm from "../components/FlashcardForm.jsx";
import CategoryGrid from "../components/CategoryGrid.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";

const HomePage = () => {
    const {
        flashcards,
        isLoading: isLoadingFlashcards,
        getFlashcards,
        createFlashcard,
        updateFlashcard,
        deleteFlashcard,
        setCategoryFilter
    } = useFlashcardStore();

    const {
        categories,
        isLoading: isLoadingCategories,
        getCategories,
        setSelectedCategory,
        selectedCategory
    } = useCategoryStore();

    const [currentView, setCurrentView] = useState("categories"); // "categories", "flashcards"
    const [flashcardViewMode, setFlashcardViewMode] = useState("grid"); // "grid" or "detailed"
    const [editingCard, setEditingCard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategoryData, setSelectedCategoryData] = useState(null);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    const handleCategorySelect = (category) => {
        setSelectedCategoryData(category);
        setCurrentView("flashcards");

        if (category) {
            if (category._id === 'uncategorized') {
                getFlashcards('uncategorized');
                setCategoryFilter('uncategorized');
            } else {
                getFlashcards(category._id);
                setCategoryFilter(category._id);
            }
        } else {
            // Show all flashcards
            getFlashcards();
            setCategoryFilter(null);
        }
    };

    const handleBackToCategories = () => {
        setCurrentView("categories");
        setSelectedCategoryData(null);
        setCategoryFilter(null);
    };

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

    const getCategoryTitle = () => {
        if (!selectedCategoryData) return "Всі флешкартки";
        if (selectedCategoryData._id === 'uncategorized') return "Без папки";
        return selectedCategoryData.name;
    };

    const getCategoryColor = () => {
        if (!selectedCategoryData || selectedCategoryData._id === 'uncategorized') return "#6B7280";
        return selectedCategoryData.color || "#3B82F6";
    };

    const getPreselectedCategoryId = () => {
        if (!selectedCategoryData || selectedCategoryData._id === 'uncategorized') return null;
        return selectedCategoryData._id;
    };

    if (isLoadingCategories && currentView === "categories") {
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
            {currentView === "categories" ? (
                /* Categories View */
                <div className="p-6">
                    <CategoryGrid
                        onCategorySelect={handleCategorySelect}
                        selectedCategoryId={selectedCategoryData?._id}
                    />
                </div>
            ) : (
                /* Flashcards View */
                <>
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="px-8 py-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    {/* Back Button */}
                                    <button
                                        onClick={handleBackToCategories}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Повернутися до папок"
                                    >
                                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                                    </button>

                                    {/* Category Info */}
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: getCategoryColor() }}
                                        >
                                            <Folder className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">
                                                {getCategoryTitle()}
                                            </h1>
                                            <p className="text-gray-600 mt-1">
                                                {flashcards.length} {flashcards.length === 1 ? 'картка' : 'карток'} в цій папці
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* View Mode Toggle */}
                                    {flashcards.length > 0 && (
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setFlashcardViewMode("grid")}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                                    flashcardViewMode === "grid"
                                                        ? "bg-white text-blue-600 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                }`}
                                            >
                                                <Grid3X3 className="w-4 h-4" />
                                                <span>Сітка</span>
                                            </button>
                                            <button
                                                onClick={() => setFlashcardViewMode("detailed")}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                                    flashcardViewMode === "detailed"
                                                        ? "bg-white text-blue-600 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900"
                                                }`}
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Детально</span>
                                            </button>
                                        </div>
                                    )}

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

                    {/* Flashcards Content */}
                    <div className="p-6">
                        {isLoadingFlashcards ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Завантаження карток...</p>
                            </div>
                        ) : flashcards.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <BookOpen className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Немає карток в цій папці</h3>
                                <p className="text-gray-600 mb-4">Створіть свою першу флеш картку в цій папці</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Створити картку</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                {flashcardViewMode === "detailed" ? (
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
                                                    {/* Category indicator */}
                                                    {card.categoryId && (
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: card.categoryId.color }}
                                                            ></div>
                                                            <span className="text-xs text-gray-500">{card.categoryId.name}</span>
                                                        </div>
                                                    )}

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
                </>
            )}

            {/* Form Modal */}
            <FlashcardForm
                isOpen={showForm}
                onClose={closeForm}
                onSubmit={editingCard ? handleEditSubmit : handleCreateSubmit}
                editingCard={editingCard}
                isLoading={isSubmitting}
                preselectedCategoryId={getPreselectedCategoryId()}
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