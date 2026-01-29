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

interface PracticeTest {
    id: string;
    title: string;
    subject: string;
    units: string[];
    totalQuestions: number;
    time: string;
    createdAt: string;
    completed: boolean;
    score: number | null;
    attempts: number;
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

    // Initial load
    useEffect(() => {
        const savedTests = localStorage.getItem("shiksha_practice_tests");
        if (savedTests) {
            try {
                setTests(JSON.parse(savedTests));
            } catch (e) {
                console.error("Failed to parse saved tests", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("shiksha_practice_tests", JSON.stringify(tests));
    }, [tests]);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/subjects/", {
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
            const response = await fetch(`https://shiksha-gpt.com/api/subjects/${subjectId}/topics`, {
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

    const handleGeneratePracticeTest = async () => {
        if (!selectedSubject || selectedUnits.length === 0 || totalQuestions === 0) return;

        setIsGenerating(true);
        try {
            // In a real implementation, we would call an API here.
            // For now, we simulate the generation and save to local state.
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newTest: PracticeTest = {
                id: Date.now().toString(),
                title: `${selectedUnits.map(u => u.name).join(", ")} Practice Test`,
                subject: selectedSubject.name,
                units: selectedUnits.map(u => u.name),
                totalQuestions: totalQuestions,
                time: `${totalQuestions * 2} min`,
                createdAt: new Date().toISOString(),
                completed: false,
                score: null,
                attempts: 0
            };

            setTests(prev => [newTest, ...prev]);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to generate practice test", error);
        } finally {
            setIsGenerating(false);
        }
    };

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
            {tests.length === 0 ? (
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
                                            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {test.totalQuestions} Questions
                                        </span>
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {test.time}
                                        </span>
                                    </div>
                                </div>

                                <div className={viewMode === "grid" ? "mt-5 pt-5 border-t border-slate-50 dark:border-white/5 flex items-center justify-between" : "flex items-center gap-4"}>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                        <RotateCcw className="w-3.5 h-3.5" /> {test.attempts} Attempts
                                    </div>
                                    <button className="bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white transition-all duration-300 py-2.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                                        <Play className="w-3.5 h-3.5 fill-current" /> Start Test
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
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
