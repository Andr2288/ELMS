// frontend/src/components/CategoryGrid.jsx

import { useState } from "react";
import { Folder, Edit, Trash2, Plus } from "lucide-react";
import { useCategoryStore } from "../store/useCategoryStore.js";
import CategoryForm from "./CategoryForm.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";

const CategoryGrid = ({ onCategorySelect, selectedCategoryId }) => {
    const { categories, isLoading, deleteCategory } = useCategoryStore();

    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (category, e) => {
        e.stopPropagation();
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDeleteClick = (category, e) => {
        e.stopPropagation();
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCategory(categoryToDelete._id);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        } catch (error) {
            // Error handling is done in the store
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        try {
            // The actual submit is handled by CategoryForm
            // This just manages the loading state
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    const handleCategoryClick = (category) => {
        onCategorySelect(category);
    };

    // Show "All Categories" option
    const allCategoriesCard = (
        <div
            key="all"
            onClick={() => onCategorySelect(null)}
            className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${
                !selectedCategoryId
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-transparent hover:border-gray-300'
            }`}
        >
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                        <Folder className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Всі картки</h3>
                        <p className="text-gray-600 text-sm">Показати всі флешкартки</p>
                    </div>
                </div>
                <div className="text-gray-700">
                    <span className="text-2xl font-bold">
                        {categories.reduce((total, cat) => total + (cat.flashcardsCount || 0), 0)}
                    </span>
                    <span className="text-sm ml-1">карток</span>
                </div>
            </div>
        </div>
    );

    // Show "Uncategorized" option if there are uncategorized flashcards
    const uncategorizedCard = (
        <div
            key="uncategorized"
            onClick={() => onCategorySelect({ _id: 'uncategorized', name: 'Без папки' })}
            className={`bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${
                selectedCategoryId === 'uncategorized'
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-transparent hover:border-amber-300'
            }`}
        >
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Folder className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Без папки</h3>
                        <p className="text-gray-600 text-sm">Картки без категорії</p>
                    </div>
                </div>
                <div className="text-gray-700">
                    <span className="text-2xl font-bold">?</span>
                    <span className="text-sm ml-1">карток</span>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Папки</h2>
                    <p className="text-gray-600">Організуйте свої флешкартки по папках</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Нова папка</span>
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* All Categories Card */}
                {allCategoriesCard}

                {/* Uncategorized Card */}
                {uncategorizedCard}

                {/* Regular Categories */}
                {categories.map((category) => (
                    <div
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                        className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 relative group ${
                            selectedCategoryId === category._id
                                ? 'ring-2 ring-opacity-50'
                                : 'border-transparent hover:border-gray-300'
                        }`}
                        style={{
                            backgroundColor: category.color + '15',
                            borderColor: selectedCategoryId === category._id ? category.color : undefined,
                            '--tw-ring-color': category.color + '40'
                        }}
                    >
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleEdit(category, e)}
                                className="p-1.5 bg-white hover:bg-gray-50 text-blue-600 rounded-lg shadow-sm transition-colors"
                                title="Редагувати"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => handleDeleteClick(category, e)}
                                className="p-1.5 bg-white hover:bg-gray-50 text-red-600 rounded-lg shadow-sm transition-colors"
                                title="Видалити"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: category.color }}
                                >
                                    <Folder className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {category.name}
                                    </h3>
                                    {category.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-gray-700">
                                    <span className="text-2xl font-bold">
                                        {category.flashcardsCount || 0}
                                    </span>
                                    <span className="text-sm ml-1">карток</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(category.createdAt).toLocaleDateString('uk-UA')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {categories.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Folder className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Немає папок</h3>
                        <p className="text-gray-600 mb-4">Створіть свою першу папку для організації карток</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Створити папку</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Category Form Modal */}
            <CategoryForm
                isOpen={showForm}
                onClose={closeForm}
                editingCategory={editingCategory}
                isLoading={isSubmitting}
                onSubmit={handleFormSubmit}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                cardText={categoryToDelete?.name}
                isDeleting={isDeleting}
                title="Підтвердження видалення папки"
                message="Ви впевнені, що хочете видалити цю папку?"
                warningText="Папка повинна бути порожньою для видалення. Спочатку перемістіть або видаліть всі картки з неї."
            />
        </div>
    );
};

export default CategoryGrid;