import { useState, useEffect } from "react";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

const HomePage = () => {
    const { flashcards, isLoading, getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } = useFlashcardStore();
    const [newCardText, setNewCardText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        getFlashcards();
    }, [getFlashcards]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCardText.trim()) return;

        try {
            await createFlashcard(newCardText);
            setNewCardText("");
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating flashcard:', error);
        }
    };

    const handleEdit = (card) => {
        setEditingId(card._id);
        setEditText(card.text);
    };

    const handleSaveEdit = async () => {
        if (!editText.trim()) return;

        try {
            await updateFlashcard(editingId, editText);
            setEditingId(null);
            setEditText("");
        } catch (error) {
            console.error('Error updating flashcard:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const handleDelete = async (id) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю картку?')) {
            await deleteFlashcard(id);
        }
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
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Нова картка</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Створити нову картку</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Текст картки
                                </label>
                                <textarea
                                    value={newCardText}
                                    onChange={(e) => setNewCardText(e.target.value)}
                                    placeholder="Введіть слово або фразу..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Створити</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewCardText("");
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Скасувати</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Flashcards Grid */}
                {flashcards.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <BookOpen className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Немає карток</h3>
                        <p className="text-gray-600">Створіть свою першу флеш картку для початку вивчення</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {flashcards.map((card) => (
                            <div key={card._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    {editingId === card._id ? (
                                        <div>
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                rows="3"
                                            />
                                            <div className="flex space-x-2 mt-3">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                                >
                                                    <Save className="w-3 h-3" />
                                                    <span>Зберегти</span>
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                    <span>Скасувати</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-900 mb-4 min-h-[60px] break-words">{card.text}</p>
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
                                                        onClick={() => handleDelete(card._id)}
                                                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;