// frontend/src/components/DetailedFlashcardView.jsx

import { useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Trash2, Volume2 } from "lucide-react";

const DetailedFlashcardView = ({ flashcards, onEdit, onDelete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-lg">Немає карток для відображення</p>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    const nextCard = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Card Counter */}
            <div className="text-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    {currentIndex + 1} з {flashcards.length}
                </span>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[380px] md:h-[420px] relative">
                <div
                    className="transition-transform duration-500 h-full cursor-pointer relative"
                    onClick={handleFlip}
                >
                    {/* Front Side */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                            isFlipped ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        <div className="h-full flex flex-col justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-3 break-words max-w-md">
                                    {currentCard.text}
                                </h2>

                                {currentCard.transcription && (
                                    <p className="text-base text-gray-600 mb-4 font-mono">
                                        [{currentCard.transcription}]
                                    </p>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speakText(currentCard.text);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors mb-6"
                                    title="Прослухати вимову"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>

                                <p className="text-gray-500 text-base">
                                    Натисніть, щоб побачити переклад
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                            isFlipped ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <div className="h-full flex flex-col p-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="overflow-y-auto flex-1 space-y-3">
                                {/* Word and Transcription */}
                                <div className="text-center border-b border-green-200 pb-2 mb-3">
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
                                        <p className="text-gray-700 italic text-sm leading-relaxed bg-gray-50 p-2 rounded">
                                            "{currentCard.example}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-500 text-center text-xs mt-2 pb-1">
                                Натисніть, щоб повернутися до слова
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Actions */}
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(currentCard);
                        }}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white text-blue-600 p-2 rounded-full shadow-lg transition-colors"
                        title="Редагувати"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(currentCard._id);
                        }}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 p-2 rounded-full shadow-lg transition-colors"
                        title="Видалити"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Попередня</span>
                </button>

                <div className="flex space-x-1">
                    {flashcards.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsFlipped(false);
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextCard}
                    disabled={currentIndex === flashcards.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                >
                    <span>Наступна</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default DetailedFlashcardView;