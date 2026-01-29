"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    BookOpen,
    Clock,
    SquareStack,
    X,
    ChevronDown,
    Loader2,
    CheckCircle2,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    History
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

interface FlashcardSet {
    id: string;
    title: string;
    cards: any[];
    subject: string;
    unit: string;
    time: string;
    createdAt: string;
}

export default function FlashcardsPage() {
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [numCards, setNumCards] = useState(10);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());

    // Load flashcards from localStorage on mount
    useEffect(() => {
        const savedSets = localStorage.getItem("shiksha_flashcards");
        if (savedSets) {
            try {
                setFlashcardSets(JSON.parse(savedSets));
            } catch (e) {
                console.error("Failed to parse saved flashcards", e);
            }
        }
    }, []);

    // Save flashcards to localStorage whenever they change
    useEffect(() => {
        if (flashcardSets.length > 0) {
            localStorage.setItem("shiksha_flashcards", JSON.stringify(flashcardSets));
        }
    }, [flashcardSets]);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/subjects/", {
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
            const response = await fetch(`https://shiksha-gpt.com/api/subjects/${subjectId}/topics`, {
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
        setNumCards(10);
        setUnits([]);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleStartFlashcards = (set: FlashcardSet) => {
        setActiveSet(set);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setViewedCards(new Set([0]));
    };

    const handleNextCard = () => {
        if (activeSet && currentCardIndex < activeSet.cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
            setViewedCards(prev => new Set(prev).add(currentCardIndex + 1));
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const resetFlashcardState = () => {
        setActiveSet(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setViewedCards(new Set());
    };

    const handleGenerateFlashcards = async () => {
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

            // Using same API as quiz but we'll treat questions/answers as front/back of flashcards
            const response = await fetch("https://shiksha-gpt.com/api/generate/quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: selectedSubject.name,
                    unit: selectedUnit.name,
                    size: numCards,
                    grade: userData.grade || "",
                    country: userData.country || "",
                    curriculum: userData.curriculum || ""
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newSet: FlashcardSet = {
                    id: data.quiz_id || Date.now().toString(),
                    title: `${selectedUnit.name} Flashcards`,
                    cards: data.response,
                    subject: selectedSubject.name,
                    unit: selectedUnit.name,
                    time: `${numCards} cards`,
                    createdAt: data.metadata?.created_at || new Date().toISOString()
                };
                setFlashcardSets(prev => [newSet, ...prev]);
                handleCloseModal();
                handleStartFlashcards(newSet);
            }
        } catch (error) {
            console.error("Failed to generate flashcards", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (activeSet) {
        const currentCard = activeSet.cards[currentCardIndex];
        const progress = ((viewedCards.size) / activeSet.cards.length) * 100;

        return (
            <div className="max-w-[700px] mx-auto p-4 py-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button onClick={resetFlashcardState} className="text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-1.5 text-[11px] font-bold transition-colors">
                        <X className="w-3.5 h-3.5" /> Exit
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Flip Card</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            {currentCardIndex + 1} / {activeSet.cards.length}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentCardIndex + 1) / activeSet.cards.length) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>

                {/* Flashcard Component */}
                <div className="perspective-1000 min-h-[320px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative w-full h-full min-h-[320px]"
                    >
                        {/* Front Side */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white dark:bg-[#121214] border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-primary/5"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Question</span>
                            <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-tight px-4">
                                {currentCard.question}
                            </h2>
                            <div className="mt-8 flex items-center gap-2 text-primary/30">
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Flip</span>
                            </div>
                        </div>

                        {/* Back Side */}
                        <div
                            className="absolute inset-0 w-full h-full bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 dark:border-primary/40 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-primary/10"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                        >
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest mb-4 block">Answer</span>
                            <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-tight px-4">
                                {currentCard.answer || currentCard.correct_answer || "No answer available"}
                            </h2>
                            <div className="mt-8 flex items-center gap-2 text-primary/30">
                                <RotateCw className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Flip</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                        disabled={currentCardIndex === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <div className="flex gap-3">
                        {currentCardIndex === activeSet.cards.length - 1 ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); resetFlashcardState(); }}
                                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Finish session
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                            >
                                Next Card <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <SquareStack className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white tracking-tight">Flashcards</h1>
                        <p className="text-slate-500 text-xs">Master your subjects with interactive cards.</p>
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
                        <Plus className="w-4 h-4" /> Generate Flashcards
                    </button>
                </div>
            </div>

            {flashcardSets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                        <SquareStack className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">No flashcards yet</h3>
                        <p className="text-slate-500 text-sm max-w-[250px]">Generate your first set of flashcards to start studying.</p>
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
                        {flashcardSets.map((set) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                    layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                                    opacity: { duration: 0.2 }
                                }}
                                key={set.id}
                                onClick={() => handleStartFlashcards(set)}
                                className={`bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/30 hover:shadow-md group cursor-pointer overflow-hidden ${viewMode === "grid" ? "p-3" : "p-2.5 flex items-center justify-between"
                                    }`}
                            >
                                <motion.div layout className={`flex items-center gap-2.5 ${viewMode === "grid" ? "mb-2" : ""}`}>
                                    <motion.div
                                        layout
                                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-indigo-500/5 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white" : "bg-indigo-500/5 text-indigo-500"
                                            }`}>
                                        <SquareStack className="w-4 h-4" />
                                    </motion.div>
                                    <div className="min-w-0">
                                        <motion.h3 layout className="font-bold dark:text-white truncate text-[13px]">{set.title}</motion.h3>
                                        <motion.span layout className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-none">{set.subject}</motion.span>
                                    </div>
                                </motion.div>

                                <motion.div layout className={`flex items-center gap-3 text-slate-500 text-[9px] ${viewMode === "grid" ? "" : "ml-4"}`}>
                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                        <BookOpen className="w-2.5 h-2.5" /> {set.cards.length} Cards
                                    </span>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Generate Flashcards Modal */}
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
                                        <h2 className="text-2xl font-bold dark:text-white">Generate Flashcards</h2>
                                        <p className="text-slate-500 text-sm">Select options to create your cards</p>
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

                                    {/* Number of Cards */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Number of Cards</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[5, 10, 15, 20].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setNumCards(size)}
                                                    className={`py-3 rounded-2xl text-sm font-bold transition-all border ${numCards === size
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
                                    onClick={handleGenerateFlashcards}
                                    disabled={!selectedSubject || !selectedUnit || isGenerating}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Cards...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Create Flashcards
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
