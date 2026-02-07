"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Plus, BookOpen, Clock, X, ChevronDown, Loader2, CheckCircle2, LayoutGrid, List, Play, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";


interface Subject {
    _id: string;
    name: string;
    slug: string;
}

interface Unit {
    _id: string;
    name: string;
    subject_id: string;
}

interface Quiz {
    id: string;
    title: string;
    questions?: any[];
    subject: string;
    unit: string;
    time: string;
    createdAt: string;
    size: number;
    completed: boolean;
    score: number | null;
    attempts: number;
}

interface QuizResponse {
    question_index: number;
    selected_option_index: number;
    selected_option_text: string;
    answered_at: string;
}

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
    const [isLoadingQuizDetail, setIsLoadingQuizDetail] = useState(false);
    const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);
    const [totalQuizzes, setTotalQuizzes] = useState(0);

    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);

    const fetchQuizzes = async (currentSkip = skip, currentLimit = limit) => {
        setIsLoadingQuizzes(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/quizzes?limit=${currentLimit}&skip=${currentSkip}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTotalQuizzes(data.count || 0);

                // Fetch attempts for each quiz concurrently
                const quizDataWithAttempts = await Promise.all(
                    data.quizzes.map(async (q: any) => {
                        try {
                            const attemptsResponse = await fetch(`${API_BASE_URL}/api/quiz/${q.id}/attempts?limit=1&skip=0`, {
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            const attemptsData = await attemptsResponse.json();
                            return { ...q, attemptsCount: attemptsData.count || 0 };
                        } catch (err) {
                            console.error(`Failed to fetch attempts for quiz ${q.id}`, err);
                            return { ...q, attemptsCount: 0 };
                        }
                    })
                );

                const mappedQuizzes: Quiz[] = quizDataWithAttempts.map((q: any) => ({
                    id: q.id,
                    title: q.title,
                    subject: q.subject,
                    unit: q.unit,
                    size: q.size,
                    time: `${q.size * 1.5} min`,
                    createdAt: q.created_at,
                    completed: q.completed,
                    score: q.score,
                    attempts: q.attemptsCount,
                    questions: []
                }));

                if (currentSkip === 0) {
                    setQuizzes(mappedQuizzes);
                } else {
                    setQuizzes(prev => [...prev, ...mappedQuizzes]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        } finally {
            setIsLoadingQuizzes(false);
        }
    };

    const handleLoadMore = () => {
        const nextSkip = skip + limit;
        setSkip(nextSkip);
        fetchQuizzes(nextSkip, limit);
    };

    // Load quizzes from API on mount
    useEffect(() => {
        fetchQuizzes(0, limit);
    }, []);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/subjects/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const fetchUnits = async (subjectId: string) => {
        setIsLoadingUnits(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}/topics`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUnits(data);
            }
        } catch (error) {
            console.error("Failed to fetch units", error);
        } finally {
            setIsLoadingUnits(false);
        }
    };

    useEffect(() => {
        if (isModalOpen && subjects.length === 0) {
            fetchSubjects();
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (selectedSubject) {
            setUnits([]);
            fetchUnits(selectedSubject._id);
            setSelectedUnit(null);
        } else {
            setUnits([]);
        }
    }, [selectedSubject]);

    const resetForm = () => {
        setSelectedSubject(null);
        setSelectedUnit(null);
        setNumQuestions(5);
        setUnits([]);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const fetchQuizDetails = async (quizId: string) => {
        setIsLoadingQuizDetail(true);
        console.log("Fetching details for quiz:", quizId);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Quiz details received:", data);
                return data; // Return full data to handle state
            } else {
                console.error("Quiz detail API error:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch quiz details", error);
        } finally {
            setIsLoadingQuizDetail(false);
        }
        return null;
    };

    const handleStartQuiz = async (quiz: Quiz) => {
        if (loadingQuizId) return; // Prevent multiple clicks

        let quizToStart = { ...quiz };
        let resumeIndex = 0;
        let restoredResponses: QuizResponse[] = [];
        let restoredAnswers: Record<number, string> = {};
        let restoredStartTime = new Date().toISOString().replace("Z", "");

        if (!quiz.questions || quiz.questions.length === 0) {
            setLoadingQuizId(quiz.id);
            const data = await fetchQuizDetails(quiz.id);
            setLoadingQuizId(null);

            if (data) {
                const questions = data.questions || data.response || [];
                if (questions && questions.length > 0) {
                    quizToStart.questions = questions;

                    // Handle resuming from saved state - only if not already completed
                    if (!data.completed && data.state && data.state.responses) {
                        const responses = data.state.responses;
                        restoredResponses = responses.map((r: any) => ({
                            question_index: r.question_index,
                            selected_option_index: r.selected_option_index,
                            selected_option_text: r.selected_option_text,
                            answered_at: r.answered_at
                        }));

                        // Map answers for the UI
                        responses.forEach((r: any) => {
                            restoredAnswers[r.question_index] = r.selected_option_text;
                        });

                        resumeIndex = responses.length;

                        // If all questions are already answered, show results or first question?
                        // Usually redirect to results if complete, else to next question.
                        if (resumeIndex >= questions.length) {
                            resumeIndex = questions.length - 1; // Or show results
                        }

                        if (data.state.started_at) {
                            restoredStartTime = data.state.started_at;
                        }
                    }
                } else {
                    console.warn("No questions found for quiz:", quiz.id);
                    return;
                }
            } else {
                return;
            }
        }

        setActiveQuiz(quizToStart);
        setCurrentQuestionIndex(resumeIndex);
        setUserAnswers(restoredAnswers);
        setQuizResponses(restoredResponses);
        setStartTime(restoredStartTime);
        setShowResults(false);
        setIsAnswerChecked(false);
    };

    const handleAnswerSelect = (answer: string) => {
        if (isAnswerChecked) return;
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: answer
        }));
    };

    const submitQuizResults = async (responses: QuizResponse[], completedAt: string) => {
        if (!activeQuiz || !startTime) return;

        try {
            const token = localStorage.getItem("access_token");
            const payload = {
                quiz_id: activeQuiz.id,
                responses: responses,
                started_at: startTime,
                completed_at: completedAt
            };

            const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to submit quiz results:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
            } else {
                const data = await response.json();
                console.log("Quiz progress saved:", data);
            }
        } catch (error) {
            console.error("Error submitting quiz results", error);
        }
    };

    const handleNextStage = () => {
        if (!isAnswerChecked) {
            const selectedText = userAnswers[currentQuestionIndex];
            const currentQuestion = activeQuiz?.questions?.[currentQuestionIndex];
            if (currentQuestion) {
                const selectedIndex = currentQuestion.options.indexOf(selectedText);
                const answeredAt = new Date().toISOString().replace("Z", "");
                const newResponse: QuizResponse = {
                    question_index: currentQuestionIndex,
                    selected_option_index: selectedIndex,
                    selected_option_text: selectedText,
                    answered_at: answeredAt
                };

                const updatedResponses = [...quizResponses, newResponse];
                setQuizResponses(updatedResponses);

                // Submit progress/completion for each answered question
                // completed_at is always sent as the timestamp of the latest answer
                submitQuizResults(updatedResponses, answeredAt);
            }
            setIsAnswerChecked(true);
        } else {
            if (activeQuiz && activeQuiz.questions && currentQuestionIndex < activeQuiz.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setIsAnswerChecked(false);
            } else {
                setShowResults(true);
            }
        }
    };

    const calculateScore = () => {
        if (!activeQuiz || !activeQuiz.questions) return 0;
        let correct = 0;
        activeQuiz.questions.forEach((q, idx) => {
            const selected = userAnswers[idx];
            if (!selected) return;

            // Robust check for correct answer across different potential field names
            const correctOptionIndex = q.correct_option !== undefined ? parseInt(q.correct_option) : -1;
            const correctText = q.answer || q.correct_answer || q.correctAnswer;

            // If the API provides an index, that's our primary truth
            if (correctOptionIndex !== -1 && !isNaN(correctOptionIndex)) {
                if (selected === q.options[correctOptionIndex]) {
                    correct++;
                }
            } else {
                // Fallback to text/letter/index-matching if no direct correct_option index is found
                const selectedIdx = q.options.indexOf(selected);
                const selectedLetter = String.fromCharCode(65 + selectedIdx);

                if (
                    selected === correctText ||
                    selectedLetter === correctText ||
                    selectedIdx.toString() === correctText?.toString()
                ) {
                    correct++;
                }
            }
        });
        return correct;
    };

    const resetQuizState = () => {
        setActiveQuiz(null);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizResponses([]);
        setStartTime(null);
        setShowResults(false);
        setIsAnswerChecked(false);
        fetchQuizzes(0, limit); // Always fetch the quiz list from the api on exit
    };

    const handleGenerateQuiz = async () => {
        if (!selectedSubject || !selectedUnit) return;

        setIsGenerating(true);
        try {
            const token = localStorage.getItem("access_token");
            const userStr = localStorage.getItem("user");
            let userData: any = {};

            if (userStr) {
                try {
                    userData = JSON.parse(userStr);
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/generate/quiz`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: selectedSubject.name,
                    unit: selectedUnit.name,
                    size: numQuestions,
                    grade: userData.grade || "",
                    country: userData.country || "",
                    curriculum: userData.curriculum || ""
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newQuiz: Quiz = {
                    id: data.quiz_id || Date.now().toString(),
                    title: data.metadata.unit,
                    questions: data.response,
                    subject: data.metadata.subject,
                    unit: data.metadata.unit,
                    size: data.metadata.size,
                    time: `${data.metadata.size * 1.5} min`,
                    createdAt: data.metadata?.created_at || new Date().toISOString(),
                    completed: false,
                    score: null,
                    attempts: 0
                };
                setQuizzes(prev => [newQuiz, ...prev]);
                handleCloseModal();
                handleStartQuiz(newQuiz); // Auto-start the new quiz
            }
        } catch (error) {
            console.error("Failed to generate quiz", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (activeQuiz && activeQuiz.questions && activeQuiz.questions.length > 0) {
        const currentQuestion = activeQuiz.questions[currentQuestionIndex];

        if (!currentQuestion) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="mt-4 text-slate-500">Loading question...</p>
                </div>
            );
        }

        const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;
        const score = calculateScore();
        const accuracy = Math.round((score / activeQuiz.questions.length) * 100);

        if (showResults) {
            return (
                <div className="max-w-[500px] mx-auto p-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 text-center space-y-6 shadow-2xl shadow-primary/10"
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <HelpCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-bold dark:text-white">Quiz Completed!</h2>
                            <p className="text-slate-500 text-sm">
                                {accuracy < 60 ? "Keep practising! You can do better." : "Great job completing the quiz!"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                <div className="text-2xl font-bold text-primary">{score} / {activeQuiz.questions.length}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Total Score</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                <div className="text-2xl font-bold text-orange-500">{accuracy}%</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Accuracy</div>
                            </div>
                        </div>

                        <button
                            onClick={resetQuizState}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                        >
                            Go back to Quizzes
                        </button>
                    </motion.div>
                </div>
            );
        }

        return (
            <div className="max-w-[700px] mx-auto p-4 py-4 space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={resetQuizState} className="text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-2 text-xs font-bold">
                        <X className="w-3.5 h-3.5" /> Exit Quiz
                    </button>
                    <div className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                    </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>

                <div className="space-y-6 py-2">
                    <h2 className="text-xl font-bold dark:text-white leading-tight">
                        {currentQuestion.question}
                    </h2>

                    <div className="grid grid-cols-1 gap-2.5">
                        {currentQuestion.options.map((option: string, idx: number) => {
                            const isSelected = userAnswers[currentQuestionIndex] === option;

                            // Determine correct answer based on correct_option index or fallback text fields
                            const correctOptionIndex = currentQuestion.correct_option !== undefined ? parseInt(currentQuestion.correct_option) : -1;
                            const correctText = currentQuestion.answer || currentQuestion.correct_answer || currentQuestion.correctAnswer;

                            let isCorrect = false;
                            if (correctOptionIndex !== -1 && !isNaN(correctOptionIndex)) {
                                isCorrect = idx === correctOptionIndex;
                            } else {
                                const currentLetter = String.fromCharCode(65 + idx);
                                isCorrect = option === correctText ||
                                    currentLetter === correctText ||
                                    idx.toString() === correctText?.toString();
                            }

                            let buttonStyles = "border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 dark:text-white hover:border-slate-300 dark:hover:border-white/20";
                            let iconStyles = "border-slate-200 dark:border-white/10";

                            if (isAnswerChecked) {
                                if (isCorrect) {
                                    buttonStyles = "border-green-500 bg-green-500/5 text-green-600 dark:text-green-400";
                                    iconStyles = "border-green-500 bg-green-500 text-white";
                                } else if (isSelected) {
                                    buttonStyles = "border-red-500 bg-red-500/5 text-red-600 dark:text-red-400";
                                    iconStyles = "border-red-500 bg-red-500 text-white";
                                } else {
                                    buttonStyles = "border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 dark:text-white opacity-50";
                                }
                            } else if (isSelected) {
                                buttonStyles = "border-primary bg-primary/5 text-primary shadow-md shadow-primary/5";
                                iconStyles = "border-primary bg-primary text-white";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswerChecked}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-bold group flex items-center justify-between ${buttonStyles}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-colors ${iconStyles}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-sm">{option}</span>
                                    </span>
                                    {isAnswerChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {isAnswerChecked && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500" />}
                                    {!isAnswerChecked && isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleNextStage}
                        disabled={!userAnswers[currentQuestionIndex]}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {!isAnswerChecked ? "Submit Answer" : (isLastQuestion ? "Finish Quiz" : "Next Question")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white tracking-tight">Tests & Quizzes</h1>
                        <p className="text-slate-500 text-xs">Test your knowledge and track your progress.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" /> Generate Quiz
                    </button>
                </div>
            </div>

            {isLoadingQuizzes ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-slate-500 text-sm">Loading quizzes...</p>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">No quizzes yet</h3>
                        <p className="text-slate-500 text-sm max-w-[250px]">Generate your first quiz to start testing your knowledge.</p>
                    </div>
                </div>
            ) : (
                <motion.div
                    layout
                    transition={{
                        layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                    }}
                    className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" : "flex flex-col gap-2"}
                >
                    <AnimatePresence mode="popLayout">
                        {quizzes.map((quiz) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                    layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                                    opacity: { duration: 0.2 }
                                }}
                                key={quiz.id}
                                className={`bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/30 hover:shadow-xl group overflow-hidden transition-all duration-300 ${viewMode === "grid" ? "p-4" : "p-3 flex items-center justify-between"
                                    }`}
                            >
                                <div className={viewMode === "grid" ? "space-y-4" : "flex items-center gap-6 flex-1 pr-6"}>
                                    <motion.div layout className={`flex items-center gap-3 ${viewMode === "grid" ? "" : "flex-1 min-w-0"}`}>
                                        <motion.div
                                            layout
                                            layoutId={`quiz-icon-${quiz.id}`}
                                            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${viewMode === "grid" ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" : "bg-primary/5 text-primary"
                                                }`}>
                                            <HelpCircle className="w-5 h-5" />
                                        </motion.div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <motion.h3 layout layoutId={`quiz-title-${quiz.id}`} className="font-bold dark:text-white truncate text-sm leading-none">{quiz.title}</motion.h3>
                                            </div>
                                            <motion.span layout layoutId={`quiz-subject-${quiz.id}`} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">{quiz.subject}</motion.span>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {!quiz.completed && quiz.attempts > 0 && (
                                                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[7px] font-bold uppercase tracking-wider flex items-center gap-1 border border-orange-500/20 w-fit">
                                                        <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                                        In Progress
                                                    </span>
                                                )}
                                                {quiz.completed && (
                                                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[7px] font-bold uppercase tracking-wider flex items-center gap-1 border border-green-500/20 w-fit">
                                                        <CheckCircle2 className="w-2 h-2" />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div layout className={`flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500 text-[10px]`}>
                                        <span className="flex items-center gap-1.5 whitespace-nowrap font-medium">
                                            <BookOpen className="w-3 h-3 text-slate-400" /> {quiz.size} Qs
                                        </span>
                                        <span className="flex items-center gap-1.5 whitespace-nowrap border-l border-slate-100 dark:border-slate-800 pl-4 font-medium">
                                            <Clock className="w-3 h-3 text-slate-400" /> {quiz.time}
                                        </span>
                                        {loadingQuizId === quiz.id && (
                                            <span className="flex items-center gap-1.5 whitespace-nowrap border-l border-slate-100 dark:border-slate-800 pl-4">
                                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                            </span>
                                        )}
                                    </motion.div>
                                </div>

                                <div className={viewMode === "grid" ? "mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between" : "flex items-center gap-6"}>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-500 text-[10px]">
                                        <RotateCcw className="w-3 h-3" /> {quiz.attempts} {quiz.attempts === 1 ? 'Attempt' : 'Attempts'}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartQuiz(quiz);
                                        }}
                                        className={`bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all duration-300 py-2 px-4 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap`}
                                    >
                                        <Play className="w-3 h-3 fill-current" /> Play Quiz
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!isLoadingQuizzes && quizzes.length < totalQuizzes && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white hover:border-primary/30 transition-all flex items-center gap-2"
                    >
                        Load More Quizzes
                    </button>
                </div>
            )}

            {/* Generate Quiz Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[500px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-white/10"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold dark:text-white">Generate Quiz</h2>
                                        <p className="text-slate-500 text-sm">Select options to create your quiz</p>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 dark:text-white" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Subject Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none dark:text-white text-sm"
                                                value={selectedSubject?._id || ""}
                                                onChange={(e) => {
                                                    const sub = subjects.find(s => s._id === e.target.value);
                                                    setSelectedSubject(sub || null);
                                                }}
                                                disabled={isLoadingSubjects}
                                            >
                                                <option value="" className="dark:bg-[#1A1A1E]">
                                                    {isLoadingSubjects ? "Loading..." : subjects.length === 0 ? "No Subject" : "Select Subject"}
                                                </option>
                                                {subjects.map(sub => (
                                                    <option key={sub._id} value={sub._id} className="dark:bg-[#1A1A1E]">{sub.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                {isLoadingSubjects ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unit Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit / Topic</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none dark:text-white text-sm disabled:opacity-50"
                                                value={selectedUnit?._id || ""}
                                                onChange={(e) => {
                                                    const unit = units.find(u => u._id === e.target.value);
                                                    setSelectedUnit(unit || null);
                                                }}
                                                disabled={!selectedSubject || isLoadingUnits}
                                            >
                                                <option value="" className="dark:bg-[#1A1A1E]">
                                                    {!selectedSubject ? "Select Subject First" : isLoadingUnits ? "Loading..." : units.length === 0 ? "No Unit" : "Select Unit"}
                                                </option>
                                                {units.map(unit => (
                                                    <option key={unit._id} value={unit._id} className="dark:bg-[#1A1A1E]">{unit.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                {isLoadingUnits ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Number of Questions */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Number of Questions</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[5, 10, 15, 20].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setNumQuestions(size)}
                                                    className={`py-3 rounded-2xl text-sm font-bold transition-all border ${numQuestions === size
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={!selectedSubject || !selectedUnit || isGenerating}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Quiz...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Create Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
