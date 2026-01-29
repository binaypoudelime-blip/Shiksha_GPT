"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    BookOpen,
    Plus,
    Clock,
    X,
    ChevronDown,
    Loader2,
    LayoutGrid,
    List,
    Search,
    ArrowUp,
    FileText,
    History,
    Sparkles,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

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

interface Summary {
    id: string;
    summary_id: string;
    title: string;
    content: string;
    subject: string;
    unit: string;
    grade: string;
    deep_search: boolean;
    createdAt: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export default function SummariesPage() {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [deepSearch, setDeepSearch] = useState(false);
    const [grade, setGrade] = useState("10"); // Default grade
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [activeSummary, setActiveSummary] = useState<Summary | null>(null);
    const [followUpQuestion, setFollowUpQuestion] = useState("");
    const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load summarizer cards from localStorage on mount
    useEffect(() => {
        const savedSummarizer = localStorage.getItem("shiksha_summarizer");
        if (savedSummarizer) {
            try {
                setSummaries(JSON.parse(savedSummarizer));
            } catch (e) {
                console.error("Failed to parse saved summarizer cards", e);
            }
        }
    }, []);

    // Save summarizer cards to localStorage whenever they change
    useEffect(() => {
        if (summaries.length > 0) {
            localStorage.setItem("shiksha_summarizer", JSON.stringify(summaries));
        }
    }, [summaries]);

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

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
        }
    }, [followUpQuestion]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAskingFollowUp]);

    const resetForm = () => {
        setSelectedSubject(null);
        setSelectedUnit(null);
        setDeepSearch(false);
        setUnits([]);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleViewSummary = (summary: Summary) => {
        setActiveSummary(summary);
        setMessages([]); // Reset messages when viewing a different summary
    };

    const handleExitSummary = () => {
        setActiveSummary(null);
        setMessages([]);
    };

    const handleGenerateSummary = async () => {
        if (!selectedSubject || !selectedUnit) return;

        setIsGenerating(true);
        try {
            const token = localStorage.getItem("access_token");
            const userStr = localStorage.getItem("user");
            if (!userStr) {
                console.error("User not found in localStorage");
                return;
            }

            const user = JSON.parse(userStr);
            const userId = user._id;
            const userGrade = user.grade;

            const response = await fetch("https://shiksha-gpt.com/api/generate/summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    subject: selectedSubject.name,
                    unit: selectedUnit.name,
                    deep_search: false,
                    grade: userGrade.toString(),
                    country: user.country,
                    curriculum: user.curriculum
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newSummary: Summary = {
                    id: Date.now().toString(),
                    summary_id: data.summary_id,
                    title: `${selectedUnit.name} Summary`,
                    content: data.response,
                    subject: selectedSubject.name,
                    unit: selectedUnit.name,
                    grade: grade,
                    deep_search: deepSearch,
                    createdAt: new Date().toISOString()
                };
                setSummaries(prev => [newSummary, ...prev]);
                handleCloseModal();
                handleViewSummary(newSummary);
            }
        } catch (error) {
            console.error("Failed to generate summary", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendFollowUp = async () => {
        if (!followUpQuestion.trim() || isAskingFollowUp || !activeSummary) return;

        const question = followUpQuestion;
        setFollowUpQuestion("");

        const newUserMessage: Message = {
            role: "user",
            content: question,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsAskingFollowUp(true);

        try {
            const token = localStorage.getItem("access_token");
            const userStr = localStorage.getItem("user");
            if (!userStr) return;

            const user = JSON.parse(userStr);
            const userId = user._id || user.id || user.user_id;

            const response = await fetch("https://shiksha-gpt.com/api/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    prompt: `Context: This is a summary of ${activeSummary.unit} in ${activeSummary.subject}.\nSummary Content: ${activeSummary.content}\n\nUser Question: ${question}`,
                    "deep-search": activeSummary.deep_search
                })
            });

            if (response.ok) {
                const data = await response.json();
                // The chat API returns data.messages which includes the response
                setMessages(prev => [...prev, data.messages[data.messages.length - 1]]);
            }
        } catch (error) {
            console.error("Failed to send follow up", error);
        } finally {
            setIsAskingFollowUp(false);
        }
    };

    const handleDeleteSummary = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSummaries(prev => prev.filter(s => s.id !== id));
    };

    if (activeSummary) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50 dark:bg-[#0A0A0B] z-10 py-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExitSummary}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white leading-tight">
                                {activeSummary.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    {activeSummary.subject}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Content & Follow-ups */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-32">
                    {/* Main Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
                    >
                        <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-slate-500" {...props} />,
                                    code: ({ node, ...props }) => <code className="bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />
                                }}
                            >
                                {activeSummary.content.replace(/\\n/g, '\n')}
                            </ReactMarkdown>
                        </div>
                    </motion.div>

                    {/* Follow-up Messages */}
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] ${msg.role === 'user'
                                ? 'bg-primary text-white shadow-lg shadow-primary/10'
                                : 'bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-slate-800 dark:text-slate-200'
                                }`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}

                    {isAskingFollowUp && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Follow-up Input */}
                <div className="absolute bottom-4 left-0 right-0 px-4 flex flex-col items-center pointer-events-none">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#1A1A1E] backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-[32px] p-2 flex flex-col gap-1 shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-2 px-3 pt-1">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={followUpQuestion}
                                onChange={(e) => setFollowUpQuestion(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendFollowUp();
                                    }
                                }}
                                placeholder="Ask a follow-up question..."
                                className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                            <button
                                onClick={handleSendFollowUp}
                                disabled={!followUpQuestion.trim() || isAskingFollowUp}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${followUpQuestion.trim() && !isAskingFollowUp
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600"
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white tracking-tight">Summaries</h1>
                        <p className="text-slate-500 text-xs">Generate concise summaries of your study topics.</p>
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
                        <Plus className="w-4 h-4" /> Generate Summary
                    </button>
                </div>
            </div>

            {summaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">No summaries yet</h3>
                        <p className="text-slate-500 text-sm max-w-[250px]">Select a subject and unit to generate your first summary.</p>
                    </div>
                </div>
            ) : (
                <motion.div
                    layout
                    transition={{ layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }}
                    className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}
                >
                    <AnimatePresence mode="popLayout">
                        {summaries.map((summary) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={summary.id}
                                onClick={() => handleViewSummary(summary)}
                                className={`bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/30 hover:shadow-md group cursor-pointer overflow-hidden p-5 transition-all ${viewMode === "list" ? "flex items-center justify-between" : "flex flex-col gap-4"
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold dark:text-white truncate text-sm">{summary.title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest">{summary.subject}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                            <span className="text-[9px] font-bold text-slate-400 capitalize">{summary.unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold transition-colors">
                                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Clock className="w-3 h-3" /> {new Date(summary.createdAt).toLocaleDateString()}
                                        </span>
                                        {summary.deep_search && (
                                            <span className="flex items-center gap-1 text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded italic">
                                                <Sparkles className="w-2.5 h-2.5" /> Deep
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSummary(e, summary.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Generate Summary Modal */}
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
                                        <h2 className="text-2xl font-bold dark:text-white">Generate Summary</h2>
                                        <p className="text-slate-500 text-sm">Select options to create your summary</p>
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

                                </div>

                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={!selectedSubject || !selectedUnit || isGenerating}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Summary...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Create Summary
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
