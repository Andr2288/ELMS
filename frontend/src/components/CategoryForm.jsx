// frontend/src/components/CategoryForm.jsx

import { useState, useEffect } from "react";
import { Save, X, Folder } from "lucide-react";
import { useCategoryStore } from "../store/useCategoryStore.js";

const CategoryForm = ({ isOpen, onClose, editingCategory, isLoading }) => {
    const { createCategory, updateCategory, getCategoryColors } = useCategoryStore();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#3B82F6"
    });

    const colors = getCategoryColors();

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name || "",
                description: editingCategory.description || "",
                color: editingCategory.color || "#3B82F6"
            });
        } else {
            setFormData({
                name: "",
                description: "",
                color: "#3B82F6"
            });
        }
    }, [editingCategory, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, formData);
            } else {
                await createCategory(formData);
            }
            onClose();
        } catch (error) {
            console.error('Error submitting category form:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: formData.color }}>
                                <Folder className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? "Редагувати папку" : "Створити папку"}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Назва папки <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Введіть назву папки..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Максимум 100 символів
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Опис (опціонально)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Короткий опис папки..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows="3"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Максимум 500 символів
                        </p>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Колір папки
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleInputChange('color', color)}
                                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                                        formData.color === color
                                            ? 'border-gray-900 scale-110'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={`Вибрати колір ${color}`}
                                >
                                    {formData.color === color && (
                                        <div className="w-full h-full rounded-md bg-white bg-opacity-30 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {formData.name && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Попередній перегляд:</h3>
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: formData.color }}
                                >
                                    <Folder className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{formData.name}</div>
                                    {formData.description && (
                                        <div className="text-sm text-gray-600">{formData.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{editingCategory ? "Зберегти зміни" : "Створити папку"}</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Скасувати
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;