// frontend/src/pages/SettingsPage.jsx

import { useState } from "react";
import { Settings, Key, TestTube, CheckCircle, XCircle, AlertTriangle, Volume2 } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const SettingsPage = () => {
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [isTestingTTS, setIsTestingTTS] = useState(false);
    const [isCheckingModels, setIsCheckingModels] = useState(false);
    const [apiTestResult, setApiTestResult] = useState(null);
    const [ttsTestResult, setTtsTestResult] = useState(null);
    const [modelsResult, setModelsResult] = useState(null);

    const testOpenAIKey = async () => {
        setIsTestingApi(true);
        setApiTestResult(null);

        try {
            const response = await axiosInstance.get("/tts/test");

            setApiTestResult({
                success: true,
                message: "OpenAI API ключ працює правильно!",
                details: `Тестова відповідь: ${response.data.test_response}`
            });

            toast.success("API ключ валідний!");

        } catch (error) {
            console.error("API test failed:", error);

            let errorMessage = "Помилка перевірки API ключа";
            let errorDetails = "";

            if (error.response?.status === 401) {
                errorMessage = "Невалідний API ключ";
                errorDetails = "Перевірте правильність ключа в .env файлі на сервері";
            } else if (error.response?.status === 402) {
                errorMessage = "Проблема з біллінгом OpenAI";
                errorDetails = "Недостатньо кредитів або проблема з оплатою";
            } else if (error.response?.status === 429) {
                errorMessage = "Перевищено ліміт запитів";
                errorDetails = "Спробуйте пізніше";
            } else if (error.response?.status === 500) {
                errorMessage = "API ключ не налаштований";
                errorDetails = "Ключ відсутній в конфігурації сервера";
            } else {
                errorDetails = error.response?.data?.details || "Невідома помилка";
            }

            setApiTestResult({
                success: false,
                message: errorMessage,
                details: errorDetails
            });

            toast.error(errorMessage);

        } finally {
            setIsTestingApi(false);
        }
    };

    const testTTS = async () => {
        setIsTestingTTS(true);
        setTtsTestResult(null);

        try {
            const response = await axiosInstance.get("/tts/test-tts");

            setTtsTestResult({
                success: true,
                message: "TTS API працює правильно!",
                details: `Розмір тестового аудіо: ${response.data.audio_size} байт`
            });

            toast.success("TTS API працює!");

        } catch (error) {
            console.error("TTS test failed:", error);

            let errorMessage = "Помилка TTS API";
            let errorDetails = "";

            if (error.response?.status === 401) {
                errorMessage = "Невалідний API ключ для TTS";
                errorDetails = "Ключ неправильний або немає дозволу на TTS";
            } else if (error.response?.status === 402) {
                errorMessage = "Недостатньо кредитів для TTS";
                errorDetails = "Поповніть баланс OpenAI";
            } else if (error.response?.status === 429) {
                errorMessage = "Перевищено ліміт TTS запитів";
                errorDetails = "Спробуйте пізніше";
            } else {
                errorDetails = error.response?.data?.error || "Невідома помилка TTS";
            }

            setTtsTestResult({
                success: false,
                message: errorMessage,
                details: errorDetails
            });

            toast.error(errorMessage);

        } finally {
            setIsTestingTTS(false);
        }
    };

    const checkModels = async () => {
        setIsCheckingModels(true);
        setModelsResult(null);

        try {
            const response = await axiosInstance.get("/tts/models");

            setModelsResult({
                success: true,
                message: "Моделі отримано успішно!",
                details: `Всього моделей: ${response.data.total_models}, TTS моделей: ${response.data.tts_models.length}`,
                tts_models: response.data.tts_models,
                sample_models: response.data.all_models
            });

            toast.success("Моделі завантажено!");

        } catch (error) {
            console.error("Models check failed:", error);

            setModelsResult({
                success: false,
                message: "Помилка отримання моделей",
                details: error.response?.data?.error || "Невідома помилка"
            });

            toast.error("Помилка перевірки моделей");

        } finally {
            setIsCheckingModels(false);
        }
    };

    return (
        <div className="ml-64 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>
                            <p className="text-gray-600 mt-1">Конфігурація та тестування системи</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* OpenAI API Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <Key className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">OpenAI API Налаштування</h2>
                            </div>
                            <p className="text-gray-600 mt-1">Перевірка статусу API ключа для функції озвучення</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                {/* API Key Test */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Тест загального API</h3>
                                        <p className="text-gray-600 text-sm">Перевірка основного API ключа OpenAI</p>
                                    </div>
                                    <button
                                        onClick={testOpenAIKey}
                                        disabled={isTestingApi}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
                                    >
                                        {isTestingApi ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Тестування...</span>
                                            </>
                                        ) : (
                                            <>
                                                <TestTube className="w-4 h-4" />
                                                <span>Тест API</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* TTS Test */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Тест TTS функції</h3>
                                        <p className="text-gray-600 text-sm">Перевірка конкретно функції озвучення</p>
                                    </div>
                                    <button
                                        onClick={testTTS}
                                        disabled={isTestingTTS}
                                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm"
                                    >
                                        {isTestingTTS ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Тестування...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Volume2 className="w-4 h-4" />
                                                <span>Тест TTS</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Models Check */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Перевірка доступних моделей</h3>
                                        <p className="text-gray-600 text-sm">Подивитися які моделі доступні для вашого API ключа</p>
                                    </div>
                                    <button
                                        onClick={checkModels}
                                        disabled={isCheckingModels}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm"
                                    >
                                        {isCheckingModels ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Перевіряю...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Settings className="w-4 h-4" />
                                                <span>Перевірити моделі</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* API Test Result */}
                                {apiTestResult && (
                                    <div className={`p-4 rounded-lg border ${
                                        apiTestResult.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            {apiTestResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            )}
                                            <div>
                                                <h4 className={`font-medium ${
                                                    apiTestResult.success ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                    Загальний API: {apiTestResult.message}
                                                </h4>
                                                {apiTestResult.details && (
                                                    <p className={`text-sm mt-1 ${
                                                        apiTestResult.success ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {apiTestResult.details}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TTS Test Result */}
                                {ttsTestResult && (
                                    <div className={`p-4 rounded-lg border ${
                                        ttsTestResult.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            {ttsTestResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            )}
                                            <div>
                                                <h4 className={`font-medium ${
                                                    ttsTestResult.success ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                    TTS API: {ttsTestResult.message}
                                                </h4>
                                                {ttsTestResult.details && (
                                                    <p className={`text-sm mt-1 ${
                                                        ttsTestResult.success ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {ttsTestResult.details}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Models Result */}
                                {modelsResult && (
                                    <div className={`p-4 rounded-lg border ${
                                        modelsResult.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            {modelsResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className={`font-medium ${
                                                    modelsResult.success ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                    Моделі: {modelsResult.message}
                                                </h4>
                                                {modelsResult.details && (
                                                    <p className={`text-sm mt-1 ${
                                                        modelsResult.success ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {modelsResult.details}
                                                    </p>
                                                )}
                                                {modelsResult.tts_models && modelsResult.tts_models.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-green-800 font-medium">TTS моделі:</p>
                                                        <p className="text-xs text-green-700 mt-1">
                                                            {modelsResult.tts_models.join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                                {modelsResult.sample_models && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-green-800 font-medium">Приклади моделей:</p>
                                                        <p className="text-xs text-green-700 mt-1">
                                                            {modelsResult.sample_models.slice(0, 5).join(', ')}...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* API Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">Інструкції з налаштування</h4>
                                            <div className="text-sm text-blue-700 mt-1 space-y-1">
                                                <p>• API ключ налаштовується в файлі .env на сервері</p>
                                                <p>• Отримайте ключ на platform.openai.com/account/api-keys</p>
                                                <p>• Переконайтеся що у вас є кредити на рахунку</p>
                                                <p>• При зміні ключа перезапустіть сервер</p>
                                                <p>• <strong>Спочатку тестуйте загальний API, потім TTS</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other Settings Sections */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Загальні налаштування</h2>
                            <p className="text-gray-600 mt-1">Основні параметри застосунку</p>
                        </div>

                        <div className="p-6">
                            <div className="text-gray-600">
                                <p>Інші налаштування будуть додані в майбутніх версіях...</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;