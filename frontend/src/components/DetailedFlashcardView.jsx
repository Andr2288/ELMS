// frontend/src/components/DetailedFlashcardView.jsx

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Edit, Trash2, Volume2 } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";

const DetailedFlashcardView = ({ flashcards, onEdit }) => {
    const { deleteFlashcard } = useFlashcardStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFlip = useCallback(() => {
        if (!isChanging) {
            setIsFlipped(!isFlipped);
        }
    }, [isChanging, isFlipped]);

    const nextCard = useCallback(() => {
        if (currentIndex < flashcards.length - 1 && !isChanging) {
            setIsChanging(true);
            setIsFlipped(false);
            stopCurrentAudio();
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setIsChanging(false);
            }, 150);
        }
    }, [currentIndex, flashcards.length, isChanging]);

    const prevCard = useCallback(() => {
        if (currentIndex > 0 && !isChanging) {
            setIsChanging(true);
            setIsFlipped(false);
            stopCurrentAudio();
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setIsChanging(false);
            }, 150);
        }
    }, [currentIndex, isChanging]);

    const goToCard = useCallback((index) => {
        if (index !== currentIndex && !isChanging) {
            setIsChanging(true);
            setIsFlipped(false);
            stopCurrentAudio();
            setTimeout(() => {
                setCurrentIndex(index);
                setIsChanging(false);
            }, 150);
        }
    }, [currentIndex, isChanging]);

    const stopCurrentAudio = useCallback(() => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
        }
        setIsPlayingAudio(false);
    }, [currentAudio]);

    const speakText = useCallback(async (text) => {
        if (!text || isChanging || isPlayingAudio) return;

        try {
            setIsPlayingAudio(true);

            // Stop any current audio
            stopCurrentAudio();

            const response = await axiosInstance.post("/tts/speech",
                { text },
                {
                    responseType: 'blob',
                    timeout: 30000 // 30 second timeout
                }
            );

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

            // Improved error handling based on new backend responses
            if (error.response?.status === 401) {
                toast.error("OpenAI API ключ недійсний. Перевірте налаштування в Settings");
            } else if (error.response?.status === 402) {
                toast.error("Недостатньо кредитів OpenAI. Поповніть баланс");
            } else if (error.response?.status === 429) {
                toast.error("Перевищено ліміт запитів OpenAI. Спробуйте пізніше");
            } else if (error.response?.status === 503) {
                toast.error("Проблеми з підключенням до OpenAI API");
            } else if (error.response?.status === 500) {
                toast.error("OpenAI API не налаштований на сервері");
            } else if (error.code === 'ECONNABORTED') {
                toast.error("Тайм-аут запиту. Спробуйте ще раз");
            } else {
                toast.error("Помилка генерації озвучення");
            }
        }
    }, [isChanging, isPlayingAudio, stopCurrentAudio]);

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

            // Adjust current index if necessary
            if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
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

    // Keyboard navigation - ВИПРАВЛЕНО: перевіряємо чи не вводиться текст
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Перевіряємо чи не знаходиться фокус на полі введення
            const activeElement = document.activeElement;
            const isInputField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );

            // Якщо користувач вводить текст, не обробляємо клавіші
            if (isInputField) return;

            if (event.key === 'ArrowLeft') {
                prevCard();
            } else if (event.key === 'ArrowRight') {
                nextCard();
            } else if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                handleFlip();
            } else if (event.key === 'v' || event.key === 'V' || event.key === 'м' || event.key === 'М') {
                event.preventDefault();
                if (flashcards[currentIndex]?.text) {
                    speakText(flashcards[currentIndex].text);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [prevCard, nextCard, handleFlip, speakText, currentIndex, flashcards]);

    // Stop audio when component unmounts or card changes
    useEffect(() => {
        return () => {
            stopCurrentAudio();
        };
    }, [currentIndex, stopCurrentAudio]);

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-lg">Немає карток для відображення</p>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Card Counter and Controls Info */}
            <div className="text-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    {currentIndex + 1} з {flashcards.length}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                    ← → для навігації • Пробіл/Enter для перевороту • V для озвучення
                </p>
            </div>

            {/* Main Card Container */}
            <div className="relative">
                {/* Card Actions - Outside the card */}
                <div className="absolute top-7 right-3 flex space-x-2 z-20">
                    <button
                        onClick={() => {
                            if (!isChanging) onEdit(currentCard);
                        }}
                        disabled={isChanging}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 p-2 rounded-full shadow-lg transition-colors"
                        title="Редагувати"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            if (!isChanging) handleDeleteClick(currentCard);
                        }}
                        disabled={isChanging}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-red-600 p-2 rounded-full shadow-lg transition-colors"
                        title="Видалити"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Card Content */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[380px] md:h-[420px] relative">
                    {/* Front Side */}
                    {!isFlipped && (
                        <div
                            key={`front-${currentIndex}`}
                            className={`h-full transition-all duration-300 ${
                                isChanging ? 'opacity-70' : 'opacity-100'
                            }`}
                        >
                            <div className="h-full flex flex-col justify-center items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="text-center space-y-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-3 break-words max-w-md">
                                        {currentCard.text}
                                    </h2>

                                    {currentCard.transcription && (
                                        <p className="text-base text-gray-600 font-mono">
                                            [{currentCard.transcription}]
                                        </p>
                                    )}

                                    {/* Audio Button - Separated from other content */}
                                    <div className="py-4">
                                        <button
                                            type="button"
                                            onClick={() => speakText(currentCard.text)}
                                            disabled={!currentCard.text || isPlayingAudio || isChanging}
                                            className={`px-6 py-3 rounded-lg transition-colors shadow-md ${
                                                isPlayingAudio
                                                    ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                                                    : 'bg-purple-500 hover:bg-purple-600'
                                            } disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center space-x-2 mx-auto`}
                                            title={isPlayingAudio ? "Відтворення..." : "Прослухати вимову (або натисніть V)"}
                                        >
                                            <Volume2 className="w-5 h-5" />
                                            <span>{isPlayingAudio ? "Відтворення..." : "Озвучити"}</span>
                                        </button>
                                    </div>

                                    <p className="text-gray-500 text-base">
                                        Натисніть Пробіл/Enter, щоб побачити переклад
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back Side */}
                    {isFlipped && (
                        <div
                            key={`back-${currentIndex}`}
                            className={`h-full transition-all duration-300 ${
                                isChanging ? 'opacity-70' : 'opacity-100'
                            }`}
                        >
                            <div className="h-full flex flex-col p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                                <div className="overflow-y-auto flex-1 space-y-3">
                                    {/* Word and Transcription */}
                                    <div className="text-center border-b border-slate-200 pb-2 mb-3">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {currentCard.text}
                                        </h3>
                                        {currentCard.transcription && (
                                            <p className="text-gray-600 font-mono text-sm">
                                                [{currentCard.transcription}]
                                            </p>
                                        )}
                                    </div>

                                    {/* Translation */}
                                    {currentCard.translation && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Переклад:</h4>
                                            <p className="text-lg text-gray-900 font-medium">
                                                {currentCard.translation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {currentCard.explanation && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Пояснення:</h4>
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {currentCard.explanation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Example */}
                                    {currentCard.example && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">Приклад:</h4>
                                            <p className="text-gray-700 italic text-sm leading-relaxed bg-white p-2 rounded border">
                                                "{currentCard.example}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-500 text-center text-xs mt-2 pb-1">
                                    Натисніть Пробіл/Enter, щоб повернутися до слова • V для озвучення
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Audio Status Indicator */}
                    {isPlayingAudio && (
                        <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2 z-10">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>Відтворення...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={prevCard}
                    disabled={currentIndex === 0 || isChanging}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Попередня</span>
                </button>

                <div className="flex space-x-1">
                    {flashcards.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToCard(index)}
                            disabled={isChanging}
                            className={`w-2 h-2 rounded-full transition-colors disabled:cursor-not-allowed ${
                                index === currentIndex
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextCard}
                    disabled={currentIndex === flashcards.length - 1 || isChanging}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                    <span>Наступна</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

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

export default DetailedFlashcardView;