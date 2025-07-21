// frontend/src/components/FlashcardForm.jsx

import { useState, useEffect } from "react";
import { Save, X, Volume2 } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const FlashcardForm = ({ isOpen, onClose, onSubmit, editingCard, isLoading }) => {
    const [formData, setFormData] = useState({
        text: "",
        transcription: "",
        translation: "",
        explanation: "",
        example: ""
    });
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);

    useEffect(() => {
        if (editingCard) {
            setFormData({
                text: editingCard.text || "",
                transcription: editingCard.transcription || "",
                translation: editingCard.translation || "",
                explanation: editingCard.explanation || "",
                example: editingCard.example || ""
            });
        } else {
            setFormData({
                text: "",
                transcription: "",
                translation: "",
                explanation: "",
                example: ""
            });
        }
    }, [editingCard, isOpen]);

    const stopCurrentAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
        }
        setIsPlayingAudio(false);
    };

    const speakText = async (text) => {
        if (!text || isPlayingAudio) return;

        try {
            setIsPlayingAudio(true);

            // Stop any current audio
            stopCurrentAudio();

            // Create a loading toast
            const loadingToast = toast.loading("Завантаження озвучення...");

            const response = await axiosInstance.post("/tts/speech",
                { text },
                {
                    responseType: 'blob',
                    timeout: 30000
                }
            );

            // Remove loading toast
            toast.dismiss(loadingToast);

            // Create audio blob and play
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            setCurrentAudio(audio);

            audio.onended = () => {
                setIsPlayingAudio(false);
                setCurrentAudio(null);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
                setIsPlayingAudio(false);
                setCurrentAudio(null);
                URL.revokeObjectURL(audioUrl);
                toast.error("Помилка відтворення звуку");
            };

            await audio.play();

        } catch (error) {
            setIsPlayingAudio(false);
            console.error("Error playing TTS:", error);

            if (error.response?.status === 401) {
                toast.error("OpenAI API ключ не налаштований");
            } else if (error.response?.status === 429) {
                toast.error("Перевищено ліміт запитів API");
            } else if (error.code === 'ECONNABORTED') {
                toast.error("Тайм-аут запиту. Спробуйте ще раз");
            } else {
                toast.error("Помилка генерації озвучення");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.text.trim()) return;

        try {
            await onSubmit(formData);
            stopCurrentAudio();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        stopCurrentAudio();
        onClose();
    };

    // Stop audio when component unmounts
    useEffect(() => {
        return () => {
            stopCurrentAudio();
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {editingCard ? "Редагувати картку" : "Створити нову картку"}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Word/Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Слово/Фраза <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={formData.text}
                                onChange={(e) => handleInputChange('text', e.target.value)}
                                placeholder="Введіть слово або фразу..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => speakText(formData.text)}
                                disabled={!formData.text.trim() || isPlayingAudio}
                                className={`px-4 py-3 rounded-lg transition-colors ${
                                    isPlayingAudio
                                        ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                                        : 'bg-purple-500 hover:bg-purple-600'
                                } disabled:bg-gray-300 disabled:cursor-not-allowed text-white`}
                                title={isPlayingAudio ? "Відтворення..." : "Прослухати вимову"}
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Transcription */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Транскрипція
                        </label>
                        <input
                            type="text"
                            value={formData.transcription}
                            onChange={(e) => handleInputChange('transcription', e.target.value)}
                            placeholder="[trænsˈkrɪpʃən] - фонетична транскрипція"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Опціонально: додайте фонетичну транскрипцію для правильної вимови
                        </p>
                    </div>

                    {/* Translation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Переклад
                        </label>
                        <input
                            type="text"
                            value={formData.translation}
                            onChange={(e) => handleInputChange('translation', e.target.value)}
                            placeholder="Український переклад слова..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Explanation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Пояснення
                        </label>
                        <textarea
                            value={formData.explanation}
                            onChange={(e) => handleInputChange('explanation', e.target.value)}
                            placeholder="Детальне пояснення значення, контексту використання..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows="3"
                        />
                    </div>

                    {/* Example */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Приклад вживання
                        </label>
                        <textarea
                            value={formData.example}
                            onChange={(e) => handleInputChange('example', e.target.value)}
                            placeholder="Приклад речення з використанням цього слова..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows="2"
                        />
                    </div>

                    {/* Preview */}
                    {formData.text && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Попередній перегляд:</h3>
                            <div className="text-lg font-bold text-gray-900">{formData.text}</div>
                            {formData.transcription && (
                                <div className="text-gray-600 font-mono text-sm">[{formData.transcription}]</div>
                            )}
                            {formData.translation && (
                                <div className="text-blue-600 font-medium">{formData.translation}</div>
                            )}
                        </div>
                    )}

                    {/* Audio Status */}
                    {isPlayingAudio && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-700 text-sm">Відтворення озвучення...</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !formData.text.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{editingCard ? "Зберегти зміни" : "Створити картку"}</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
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

export default FlashcardForm;