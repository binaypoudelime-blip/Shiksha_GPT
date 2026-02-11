"use client";

import React, { useState, useEffect } from "react";
import {
    ListChecks,
    Plus,
    BookOpen,
    Clock,
    X,
    ChevronDown,
    Loader2,
    CheckCircle2,
    LayoutGrid,
    List,
    Play,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Search,
    Type,
    CheckCircle,
    CircleSlash,
    Minus,
    Binary,
    FileQuestion,
    Trash2
} from "lucide-react";
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

interface QuestionTypeConfig {
    id: string;
    label: string;
    description: string;
    icon: any;
    count: number;
    color: string;
}

interface Question {
    question_id: string;
    question_type: "multiple_choice" | "truefalse" | "fillintheblanks" | "shortanswer";
    question: string;
    unit: string;
    difficulty: string;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
}

interface PracticeTest {
    id: string;
    title: string;
    subject: string;
    units: string[];
    total_questions: number;
    time?: string;
    created_at: string;
    times_attempted: number;
    average_score: number | null;
    questions?: Question[];
}

interface Attempt {
    attempt_id: string;
    attempt_number: number;
    overall_score: number;
    total_correct: number;
    total_questions: number;
    scores_by_type: Record<string, {
        correct: number;
        total: number;
        percentage: number;
    }>;
    scores_by_unit: Record<string, {
        correct: number;
        total: number;
        percentage: number;
    }>;
    total_time_seconds: number;
    status: string;
    completed_at: string;
}

export default function PracticeTestPage() {
    const [tests, setTests] = useState<PracticeTest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 & 2 state
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
    const [unitSearchQuery, setUnitSearchQuery] = useState("");

    // Step 3 state
    const [questionConfigs, setQuestionConfigs] = useState<QuestionTypeConfig[]>([
        { id: "mcq", label: "Multiple Choice", description: "Select the correct answer from options", icon: CheckCircle, count: 0, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
        { id: "tf", label: "True/False", description: "Determine if a statement is true or false", icon: CircleSlash, count: 0, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
        { id: "fib", label: "Fill in the Blank", description: "Complete the sentence with the missing word", icon: Binary, count: 0, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
        { id: "sa", label: "Short Answer", description: "Provide a brief written response", icon: FileQuestion, count: 0, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    ]);

    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isLoadingTests, setIsLoadingTests] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);
    const [totalTests, setTotalTests] = useState(0);

    // Test taking state
    const [activeTest, setActiveTest] = useState<PracticeTest | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState<string | null>(null);
    const [testStartedAt, setTestStartedAt] = useState<string | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

    // History state
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyAttempts, setHistoryAttempts] = useState<Attempt[]>([]);
    const [selectedTestForHistory, setSelectedTestForHistory] = useState<PracticeTest | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [reviewingAttempt, setReviewingAttempt] = useState<any>(null);
    const [isLoadingReview, setIsLoadingReview] = useState<string | null>(null);

    const fetchTests = async (currentSkip = skip, currentLimit = limit) => {
        setIsLoadingTests(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/practice-sets?limit=${currentLimit}&skip=${currentSkip}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTotalTests(data.count || 0);

                const mappedTests: PracticeTest[] = data.practice_sets.map((ps: any) => ({
                    ...ps,
                    id: ps.id || ps._id,
                    time: `${ps.total_questions * 2} min`
                }));

                if (currentSkip === 0) {
                    setTests(mappedTests);
                } else {
                    setTests(prev => [...prev, ...mappedTests]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch practice tests", error);
        } finally {
            setIsLoadingTests(false);
        }
    };

    useEffect(() => {
        fetchTests(0, limit);
    }, []);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/subjects/`, {
                headers: { "Authorization": `Bearer ${token}` }
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
                headers: { "Authorization": `Bearer ${token}` }
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
            setSelectedUnits([]);
        } else {
            setUnits([]);
            setSelectedUnits([]);
        }
    }, [selectedSubject]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStep(1);
        setSelectedSubject(null);
        setSelectedUnits([]);
        setUnitSearchQuery("");
        setQuestionConfigs(prev => prev.map(c => ({ ...c, count: 0 })));
    };

    const toggleUnitSelection = (unit: Unit) => {
        if (selectedUnits.find(u => u._id === unit._id)) {
            setSelectedUnits(prev => prev.filter(u => u._id !== unit._id));
        } else {
            setSelectedUnits(prev => [...prev, unit]);
        }
    };

    const handleCountChange = (id: string, delta: number) => {
        setQuestionConfigs(prev => {
            const currentTotal = prev.reduce((acc, curr) => acc + curr.count, 0);
            return prev.map(config => {
                if (config.id === id) {
                    const nextCount = config.count + delta;
                    if (delta > 0 && currentTotal >= 30) return config;
                    const newCount = Math.max(0, Math.min(20, nextCount));
                    return { ...config, count: newCount };
                }
                return config;
            });
        });
    };

    const handleDirectCountChange = (id: string, value: string) => {
        const num = parseInt(value) || 0;
        setQuestionConfigs(prev => {
            const otherTotal = prev.filter(c => c.id !== id).reduce((acc, curr) => acc + curr.count, 0);
            return prev.map(config => {
                if (config.id === id) {
                    const newCount = Math.max(0, Math.min(Math.min(20, num), 30 - otherTotal));
                    return { ...config, count: newCount };
                }
                return config;
            });
        });
    };

    const totalQuestions = questionConfigs.reduce((acc, curr) => acc + curr.count, 0);

    const resetTestState = () => {
        setActiveTest(null);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
    };

    const handleGeneratePracticeTest = async () => {
        if (!selectedSubject || selectedUnits.length === 0 || totalQuestions === 0) return;

        setIsGenerating(true);
        try {
            const token = localStorage.getItem("access_token");
            const userStr = localStorage.getItem("user");
            let userData: any = {};
            if (userStr) {
                try { userData = JSON.parse(userStr); } catch (e) { }
            }

            const qConfigPayload = {
                multiple_choice: questionConfigs.find(c => c.id === "mcq")?.count || 0,
                truefalse: questionConfigs.find(c => c.id === "tf")?.count || 0,
                fillintheblanks: questionConfigs.find(c => c.id === "fib")?.count || 0,
                shortanswer: questionConfigs.find(c => c.id === "sa")?.count || 0
            };

            const response = await fetch(`${API_BASE_URL}/api/practice-set/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: selectedSubject.name.toLowerCase(),
                    unit: selectedUnits.map(u => u.name.toLowerCase()),
                    question_type: qConfigPayload,
                    grade: userData.grade || "8",
                    country: userData.country || "nepal",
                    curriculum: userData.curriculum || "neb"
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newTest: PracticeTest = {
                    id: data.practice_set_id,
                    title: data.title,
                    subject: data.metadata.subject,
                    units: data.metadata.units,
                    total_questions: data.metadata.total_questions,
                    time: `${data.metadata.total_questions * 2} min`,
                    created_at: new Date().toISOString(),
                    times_attempted: 0,
                    average_score: null,
                    questions: data.questions
                };

                setTests(prev => [newTest, ...prev]);
                handleCloseModal();
                setActiveTest(newTest);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setShowResults(false);
                setTestStartedAt(new Date().toISOString());
                setQuestionStartTime(Date.now());
                setQuestionTimes({});
                setTestResult(null);
            }
        } catch (error) {
            console.error("Failed to generate practice test", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStartTest = async (testId: string) => {
        setIsLoadingDetail(testId);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/practice-set/${testId}?include_answers=false`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const testData: PracticeTest = {
                    id: data._id,
                    title: data.title,
                    subject: data.metadata.subject,
                    units: data.metadata.units,
                    total_questions: data.metadata.total_questions,
                    time: `${data.metadata.total_questions * 2} min`,
                    created_at: data.created_at,
                    times_attempted: data.times_attempted,
                    average_score: data.average_score,
                    questions: data.questions
                };
                setActiveTest(testData);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setShowResults(false);
                setTestStartedAt(new Date().toISOString());
                setQuestionStartTime(Date.now());
                setQuestionTimes({});
                setTestResult(null);
            }
        } finally {
            setIsLoadingDetail(null);
        }
    };

    const fetchTestHistory = async (test: PracticeTest) => {
        setSelectedTestForHistory(test);
        setShowHistoryModal(true);
        setIsLoadingHistory(true);
        setHistoryAttempts([]);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/practice-set/${test.id}/attempts?limit=10`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistoryAttempts(data.attempts || []);
            }
        } catch (error) {
            console.error("Failed to fetch test history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const fetchAttemptReview = async (practiceSetId: string, attemptId: string) => {
        setIsLoadingReview(attemptId);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/practice-set/${practiceSetId}/attempts/${attemptId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReviewingAttempt(data);
                setShowHistoryModal(false);
            }
        } catch (error) {
            console.error("Failed to fetch attempt review", error);
        } finally {
            setIsLoadingReview(null);
        }
    };

    const handleLoadMore = () => {
        const nextSkip = skip + limit;
        setSkip(nextSkip);
        fetchTests(nextSkip, limit);
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const updateTimeSpent = () => {
        if (!activeTest || !activeTest.questions) return;
        const currentQuestion = activeTest.questions[currentQuestionIndex];
        const duration = Math.floor((Date.now() - questionStartTime) / 1000);

        setQuestionTimes(prev => ({
            ...prev,
            [currentQuestion.question_id]: (prev[currentQuestion.question_id] || 0) + duration
        }));
        setQuestionStartTime(Date.now());
    };

    const handleNextQuestion = () => {
        updateTimeSpent();
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handlePreviousQuestion = () => {
        updateTimeSpent();
        setCurrentQuestionIndex(prev => prev - 1);
    };

    const handleSubmitTest = async () => {
        if (!activeTest || !activeTest.questions) return;
        setIsSubmitting(true);

        try {
            const completedAt = new Date().toISOString();
            const currentQuestion = activeTest.questions[currentQuestionIndex];
            const duration = Math.floor((Date.now() - questionStartTime) / 1000);

            const finalTimes = {
                ...questionTimes,
                [currentQuestion.question_id]: (questionTimes[currentQuestion.question_id] || 0) + duration
            };

            const responses = activeTest.questions.map(q => ({
                question_id: q.question_id,
                user_answer: userAnswers[q.question_id] || "",
                time_spent_seconds: finalTimes[q.question_id] || 0
            }));

            const payload = {
                practice_set_id: activeTest.id,
                responses,
                started_at: testStartedAt,
                completed_at: completedAt
            };

            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_BASE_URL}/api/practice-set/${activeTest.id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setTestResult(data);
                setShowResults(true);
                fetchTests(0, limit);
            }
        } catch (error) {
            console.error("Failed to submit test", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (reviewingAttempt) {
        return (
            <div className="max-w-[900px] mx-auto p-4 space-y-6 pb-20">
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                setReviewingAttempt(null);
                                setShowHistoryModal(true);
                            }}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors text-sm font-bold mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to History
                        </button>
                        <h1 className="text-2xl font-black dark:text-white tracking-tight">Review Your Test</h1>
                        <p className="text-slate-500 text-sm font-medium">Review your test, and see what you got right and wrong.</p>
                    </div>

                    <button
                        onClick={() => {
                            const testId = reviewingAttempt.practice_set_id;
                            setReviewingAttempt(null);
                            handleStartTest(testId);
                        }}
                        className="bg-primary text-white px-6 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                    >
                        <RotateCcw className="w-4 h-4" /> Retake Test
                    </button>
                </div>

                {/* Score Summary Card */}
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] p-5 flex items-center gap-5">
                    <div className="w-14 h-14 bg-pink-500/10 rounded-[16px] flex items-center justify-center shrink-0">
                        <ListChecks className="w-7 h-7 text-pink-500" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-2xl font-black text-pink-500">{reviewingAttempt.total_correct}</span>
                            <span className="text-base font-bold text-slate-400">/ {reviewingAttempt.total_questions}</span>
                        </div>
                        <p className="text-slate-500 font-bold text-[11px]">
                            You got {reviewingAttempt.total_correct} out of {reviewingAttempt.total_questions} questions correct. ({reviewingAttempt.overall_score}%)
                        </p>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                    {reviewingAttempt.responses.map((resp: any, idx: number) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex gap-4 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-base font-bold dark:text-white leading-tight pt-0.5">
                                        {resp.question_text}
                                    </h3>
                                </div>
                            </div>

                            {/* Options for MCQ */}
                            {resp.question_type === "multiple_choice" && resp.options && (
                                <div className="grid grid-cols-1 gap-2.5 ml-11">
                                    {resp.options.map((option: string, optIdx: number) => {
                                        const isCorrect = option === resp.correct_answer;
                                        const isUserSelection = option === resp.user_answer;

                                        let borderClass = "border-slate-100 dark:border-white/5";
                                        let bgClass = "bg-white dark:bg-white/5";
                                        let textClass = "dark:text-white";

                                        if (isCorrect) {
                                            borderClass = "border-emerald-500";
                                            bgClass = "bg-emerald-500/5";
                                            textClass = "text-emerald-600 dark:text-emerald-400 font-bold";
                                        } else if (isUserSelection && !resp.is_correct) {
                                            borderClass = "border-rose-500";
                                            bgClass = "bg-rose-500/5";
                                            textClass = "text-rose-600 dark:text-rose-400 font-bold";
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`p-4 rounded-[20px] border-2 transition-all flex items-center gap-4 ${borderClass} ${bgClass} ${textClass}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 text-sm font-bold ${isCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                                                    isUserSelection ? "bg-rose-500 border-rose-500 text-white" :
                                                        "border-slate-200 dark:border-white/10"
                                                    }`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </div>
                                                <span className="text-sm">{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Answers for other types */}
                            {resp.question_type !== "multiple_choice" && (
                                <div className="ml-11 space-y-3">
                                    <div className={`p-4 rounded-[20px] border-2 ${resp.is_correct ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5'}`}>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Answer</p>
                                        <p className={`text-sm font-bold ${resp.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {resp.user_answer || "No answer provided"}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-[20px] border-2 border-emerald-500/30 bg-white dark:bg-white/5">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Sample Correct Answer</p>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {resp.correct_answer}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Explanation */}
                            {resp.explanation && (
                                <div className="ml-11 p-5 bg-blue-500/5 border border-blue-500/20 rounded-[20px] space-y-1.5">
                                    <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Explanation</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {resp.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activeTest && activeTest.questions && activeTest.questions.length > 0) {
        const currentQuestion = activeTest.questions[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === activeTest.questions.length - 1;

        if (showResults) {
            return (
                <div className="max-w-[600px] mx-auto p-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 text-center space-y-6 shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-pink-500" />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-bold dark:text-white">
                                {testResult ? testResult.message : "Practice Set Completed!"}
                            </h2>
                            {testResult && (
                                <div className="flex flex-col items-center gap-2 mt-4">
                                    <div className="text-4xl font-black text-pink-500">
                                        {testResult.overall_score}%
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Correct: {testResult.total_correct} / {testResult.total_questions}
                                    </p>
                                </div>
                            )}
                            {!testResult && (
                                <p className="text-slate-500 text-sm">
                                    Excellent work. You should now review your answers to see how you did.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={resetTestState}
                                className="flex-1 bg-pink-500 text-white py-3.5 rounded-xl font-bold transition-all text-sm"
                            >
                                Done for Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return (
            <div className="max-w-[750px] mx-auto p-4 space-y-4">
                {/* Test Header */}
                <div className="flex items-center justify-between">
                    <button onClick={resetTestState} className="text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-2 text-xs font-bold">
                        <X className="w-3.5 h-3.5" /> Exit Test
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest mb-1">
                            Practice Mode
                        </span>
                        <div className="text-[10px] font-bold text-slate-400">
                            Question {currentQuestionIndex + 1} of {activeTest.total_questions}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {activeTest.time}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / activeTest.total_questions) * 100}%` }}
                        className="h-full bg-pink-500"
                    />
                </div>

                {/* Question Area */}
                <div className="space-y-5 py-2">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="px-3 py-1 bg-pink-500 text-white rounded-lg text-xs font-black shrink-0 mt-1">
                                Q{currentQuestionIndex + 1}
                            </div>
                            <h2 className="text-xl font-bold dark:text-white leading-tight">
                                {currentQuestion.question}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 ml-12">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                                {currentQuestion.question_type.replace("_", " ")}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${currentQuestion.difficulty === "easy" ? "text-emerald-500 bg-emerald-500/10" :
                                currentQuestion.difficulty === "medium" ? "text-amber-500 bg-amber-500/10" :
                                    "text-rose-500 bg-rose-500/10"
                                }`}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="ml-0 sm:ml-12 space-y-3">
                        {/* Multiple Choice & True/False */}
                        {(currentQuestion.question_type === "multiple_choice" || currentQuestion.question_type === "truefalse") && (
                            <div className="grid grid-cols-1 gap-2.5">
                                {(currentQuestion.options || (currentQuestion.question_type === "truefalse" ? ["True", "False"] : [])).map((option, idx) => {
                                    const isSelected = userAnswers[currentQuestion.question_id] === option;

                                    let styles = "border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 dark:text-white";
                                    if (isSelected) {
                                        styles = "border-pink-500 bg-pink-500/5 text-pink-500";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerChange(currentQuestion.question_id, option)}
                                            className={`w-full text-left p-3 rounded-xl border-2 transition-all font-bold group flex items-center justify-between ${styles}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 text-sm transition-all ${isSelected ? "border-pink-500 bg-pink-500 text-white" : "border-slate-200 dark:border-white/10"
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="text-sm">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Fill in the Blanks */}
                        {currentQuestion.question_type === "fillintheblanks" && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20 dark:text-white font-bold"
                                    placeholder="Type your answer here..."
                                    value={userAnswers[currentQuestion.question_id] || ""}
                                    onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                                />
                            </div>
                        )}

                        {/* Short Answer */}
                        {currentQuestion.question_type === "shortanswer" && (
                            <div className="space-y-4">
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20 dark:text-white font-bold resize-none"
                                    placeholder="Write your response..."
                                    value={userAnswers[currentQuestion.question_id] || ""}
                                    onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                                />
                            </div>
                        )}

                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 ml-0 sm:ml-12">
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {isLastQuestion ? (
                            <button
                                onClick={handleSubmitTest}
                                disabled={isSubmitting}
                                className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Finish Test"
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center gap-2"
                            >
                                Next Question <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 p-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                        <ListChecks className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white tracking-tight">Practice Tests</h1>
                        <p className="text-slate-500 text-xs">Customize your study sessions with targeted practice tests.</p>
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
                        <Plus className="w-4 h-4" /> Create Practice Test
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoadingTests && tests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-slate-500 text-sm">Loading practice tests...</p>
                </div>
            ) : tests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                    <div className="w-16 h-16 bg-pink-500/5 rounded-full flex items-center justify-center">
                        <ListChecks className="w-8 h-8 text-pink-500/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">No practice tests yet</h3>
                        <p className="text-slate-500 text-sm max-w-[250px]">Create your first personalized practice test to get started.</p>
                    </div>
                </div>
            ) : (
                <>
                    <motion.div
                        layout
                        className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}
                    >
                        <AnimatePresence mode="popLayout">
                            {tests.map((test) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={test.id}
                                    className={`bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-pink-500/30 hover:shadow-xl group overflow-hidden transition-all duration-300 ${viewMode === "grid" ? "p-5" : "p-4 flex items-center justify-between"
                                        }`}
                                >
                                    <div className={viewMode === "grid" ? "space-y-4" : "flex items-center gap-6 flex-1 pr-6"}>
                                        <div className={`flex items-center gap-3 ${viewMode === "grid" ? "" : "flex-1 min-w-0"}`}>
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm bg-pink-500/5 text-pink-500 group-hover:bg-pink-500 group-hover:text-white`}>
                                                <ListChecks className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold dark:text-white truncate text-base mb-0.5">{test.title}</h3>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">{test.subject}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500 text-xs font-medium">
                                            <span className="flex items-center gap-2 whitespace-nowrap">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {test.total_questions} Questions
                                            </span>
                                            <span className="flex items-center gap-2 whitespace-nowrap">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {test.time}
                                            </span>
                                            {isLoadingDetail === test.id && <Loader2 className="w-3 h-3 animate-spin text-pink-500" />}
                                        </div>
                                    </div>

                                    <div className={viewMode === "grid" ? "mt-5 pt-5 border-t border-slate-50 dark:border-white/5 flex items-center justify-between" : "flex items-center gap-4"}>
                                        <button
                                            onClick={() => fetchTestHistory(test)}
                                            className="flex items-center gap-2 text-slate-500 text-xs font-bold hover:text-pink-500 transition-colors"
                                        >
                                            {test.times_attempted} Attempts
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStartTest(test.id)}
                                                className="bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white transition-all duration-300 py-2.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                                            >
                                                {test.times_attempted > 0 ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />} {test.times_attempted > 0 ? "Re-take Test" : "Start Test"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {tests.length < totalTests && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold dark:text-white hover:border-pink-500/30 transition-all flex items-center gap-2"
                            >
                                Load More Tests
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Generation Modal */}
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
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[500px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-white/10"
                        >
                            <div className="relative h-full flex flex-col">
                                {/* Modal Header */}
                                <div className="p-8 pb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                                            <ListChecks className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold dark:text-white">Create Practice Test</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex gap-1 mb-0.5">
                                                    {[1, 2, 3].map((s) => (
                                                        <div
                                                            key={s}
                                                            className={`h-1 rounded-full transition-all duration-300 ${currentStep >= s ? "w-4 bg-pink-500" : "w-1.5 bg-slate-200 dark:bg-slate-800"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{currentStep} of 3</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors group"
                                    >
                                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 pt-3 overflow-y-auto max-h-[75vh]">
                                    <AnimatePresence mode="wait">
                                        {currentStep === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Choose a Subject</label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20 appearance-none dark:text-white text-sm font-bold cursor-pointer"
                                                            value={selectedSubject?._id || ""}
                                                            onChange={(e) => {
                                                                const sub = subjects.find(s => s._id === e.target.value);
                                                                if (sub) {
                                                                    setSelectedSubject(sub);
                                                                    setCurrentStep(2);
                                                                }
                                                            }}
                                                            disabled={isLoadingSubjects}
                                                        >
                                                            <option value="" className="dark:bg-[#1A1A1E]">
                                                                {isLoadingSubjects ? "Loading subjects..." : subjects.length === 0 ? "No subjects available" : "Select Subject"}
                                                            </option>
                                                            {subjects.map(sub => (
                                                                <option key={sub._id} value={sub._id} className="dark:bg-[#1A1A1E]">{sub.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            {isLoadingSubjects ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentStep === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Topics / Units</label>
                                                        <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">{selectedUnits.length} selected</span>
                                                    </div>

                                                    {/* Units Dropdown */}
                                                    <div className="relative">
                                                        <select
                                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/20 appearance-none dark:text-white text-sm font-bold cursor-pointer disabled:opacity-50"
                                                            value=""
                                                            onChange={(e) => {
                                                                const unit = units.find(u => u._id === e.target.value);
                                                                if (unit) toggleUnitSelection(unit);
                                                            }}
                                                            disabled={!selectedSubject || isLoadingUnits}
                                                        >
                                                            <option value="" className="dark:bg-[#1A1A1E]">
                                                                {!selectedSubject ? "Select Subject First" : isLoadingUnits ? "Loading topics..." : units.length === 0 ? "No topics available" : "Add a Topic..."}
                                                            </option>
                                                            {units
                                                                .filter(u => !selectedUnits.find(su => su._id === u._id))
                                                                .map(unit => (
                                                                    <option key={unit._id} value={unit._id} className="dark:bg-[#1A1A1E]">{unit.name}</option>
                                                                ))
                                                            }
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            {isLoadingUnits ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                        </div>
                                                    </div>

                                                    {/* Selected Units as Tags */}
                                                    {selectedUnits.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
                                                            {selectedUnits.map((unit) => (
                                                                <div
                                                                    key={unit._id}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#1A1A1E] border border-pink-200 dark:border-pink-500/30 rounded-xl text-xs font-bold text-pink-500 shadow-sm"
                                                                >
                                                                    {unit.name}
                                                                    <button
                                                                        onClick={() => toggleUnitSelection(unit)}
                                                                        className="p-0.5 hover:bg-pink-100 dark:hover:bg-pink-500/20 rounded-md transition-colors"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentStep === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold dark:text-white">How many questions of each type?</h3>
                                                        <p className="text-slate-500 text-xs">Select types and quantities for your test</p>
                                                    </div>

                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3.5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-pink-500/10 rounded-xl flex items-center justify-center">
                                                                <Binary className="w-4 h-4 text-pink-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Questions</p>
                                                                <p className="text-base font-black dark:text-white leading-none">{totalQuestions} <span className="text-slate-500 font-bold text-xs">/ 30</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                                                            Max 20 per type
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2">
                                                        {questionConfigs.map((config) => (
                                                            <div
                                                                key={config.id}
                                                                className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 hover:border-pink-500/10 transition-all shadow-sm"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${config.count > 0 ? config.color : "bg-slate-100 dark:bg-white/10 text-slate-400"}`}>
                                                                        <config.icon className="w-4.5 h-4.5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-bold text-xs dark:text-white truncate leading-tight mb-0.5">{config.label}</h4>
                                                                        <p className="text-[9px] text-slate-500 truncate leading-tight">{config.description}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-white/10">
                                                                    <button
                                                                        onClick={() => handleCountChange(config.id, -1)}
                                                                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"
                                                                    >
                                                                        <Minus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        className="w-7 text-center bg-transparent font-black dark:text-white text-xs outline-none"
                                                                        value={config.count}
                                                                        onChange={(e) => handleDirectCountChange(config.id, e.target.value)}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleCountChange(config.id, 1)}
                                                                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-green-500 transition-all"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 pt-2 flex gap-3">
                                    {currentStep > 1 && (
                                        <button
                                            onClick={() => setCurrentStep(prev => prev - 1)}
                                            className="px-6 py-3.5 rounded-2xl font-bold text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            onClick={() => setCurrentStep(prev => prev + 1)}
                                            disabled={(currentStep === 1 && !selectedSubject) || (currentStep === 2 && selectedUnits.length === 0)}
                                            className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            Next Step <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleGeneratePracticeTest}
                                            disabled={totalQuestions === 0 || isGenerating}
                                            className="flex-1 bg-pink-500 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generating Test...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Generate Practice Test
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistoryModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistoryModal(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] w-screen h-screen"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[600px] bg-white dark:bg-[#1A1A1E] rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-white/10"
                        >
                            <div className="relative h-full flex flex-col max-h-[85vh]">
                                {/* Modal Header */}
                                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                                            <RotateCcw className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold dark:text-white">Attempt History</h2>
                                            <p className="text-slate-500 text-xs font-medium">{selectedTestForHistory?.title}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowHistoryModal(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors group"
                                    >
                                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    {isLoadingHistory ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                                            <p className="text-slate-500 text-sm font-medium">Fetching your history...</p>
                                        </div>
                                    ) : historyAttempts.length === 0 ? (
                                        <div className="text-center py-20 space-y-4">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                <RotateCcw className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No attempts recorded yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {historyAttempts.map((attempt) => (
                                                <div
                                                    key={attempt.attempt_id}
                                                    className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4 hover:border-pink-500/20 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-xs font-black dark:text-white shadow-sm">
                                                                #{attempt.attempt_number}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold dark:text-white leading-none mb-1">Attempt #{attempt.attempt_number}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                                    {new Date(attempt.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-pink-500 leading-none mb-1">
                                                                {attempt.overall_score}%
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Score</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="p-3 bg-white dark:bg-[#1A1A1E] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Correct</p>
                                                            <p className="text-sm font-black dark:text-white">{attempt.total_correct} / {attempt.total_questions}</p>
                                                        </div>
                                                        <div className="p-3 bg-white dark:bg-[#1A1A1E] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Time</p>
                                                            <p className="text-sm font-black dark:text-white">
                                                                {Math.floor(attempt.total_time_seconds / 60)}m {attempt.total_time_seconds % 60}s
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-white dark:bg-[#1A1A1E] rounded-xl border border-slate-100 dark:border-white/5 shadow-sm text-center">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
                                                            <p className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                                                                {attempt.status}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Row for Unit Stats & Review Button */}
                                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(attempt.scores_by_unit).map(([unit, stats]) => (
                                                                <div
                                                                    key={unit}
                                                                    className="px-2.5 py-1 bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-white/10 rounded-lg flex items-center gap-1.5 shadow-sm"
                                                                >
                                                                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">{unit}</span>
                                                                    <span className="text-[10px] font-black text-pink-500">{stats.percentage}%</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => fetchAttemptReview(selectedTestForHistory?.id || "", attempt.attempt_id)}
                                                            disabled={isLoadingReview === attempt.attempt_id}
                                                            className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 font-bold text-xs transition-all whitespace-nowrap active:scale-95 px-1 underline underline-offset-4 decoration-2 decoration-pink-500/30 hover:decoration-pink-500"
                                                        >
                                                            {isLoadingReview === attempt.attempt_id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>Review Answers <ChevronRight className="w-4 h-4" /></>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 flex justify-end">
                                    <button
                                        onClick={() => setShowHistoryModal(false)}
                                        className="mt-6 px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Close History
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}
