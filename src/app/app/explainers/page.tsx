"use client";

import React, { useState, useEffect } from "react";
import {
    Film,
    Plus,
    Search,
    Play,
    Clock,
    Eye,
    X,
    Loader2,
    ChevronDown,
    Filter,
    Mic2,
    Video,
    LayoutGrid,
    List,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Explainer {
    _id: string;
    name: string;
    description: string;
    tags: string[];
    is_active: boolean;
    duration: number;
    views_count: number;
    video_url: string;
    thumbnail_url: string;
}

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

export default function ExplainersPage() {
    const [explainers, setExplainers] = useState<Explainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "video" | "audio">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedExplainer, setSelectedExplainer] = useState<Explainer | null>(null);

    // Modal states for generation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchExplainers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/explainer/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setExplainers(data);
            }
        } catch (error) {
            console.error("Failed to fetch explainers", error);
        } finally {
            setIsLoading(false);
        }
    };

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
        fetchExplainers();
    }, []);

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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredExplainers = explainers.filter(exp => {
        const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exp.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Response doesn't explicitly have a type, but we can mock it or check tags
        const isAudio = exp.tags.includes('audio') || exp.tags.includes('podcast');
        const isVideo = !isAudio;

        if (activeFilter === "video") return matchesSearch && isVideo;
        if (activeFilter === "audio") return matchesSearch && isAudio;
        return matchesSearch;
    });

    const handleGenerateExplainer = async () => {
        if (!selectedSubject || !selectedUnit) return;
        setIsGenerating(true);
        try {
            // Mocking generation delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Usually this would call an API like /api/generate/explainer
            // For now we'll just refresh list or show success
            setIsModalOpen(false);
            fetchExplainers();
        } catch (error) {
            console.error("Failed to generate explainer", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-4 p-4 pt-0 md:pt-0">
            {/* Combined Header & Filter Section */}
            <div className="bg-white dark:bg-[#121214] p-3 md:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                            <Film className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold dark:text-white tracking-tight">Explainers</h1>
                            <p className="text-slate-500 text-[10px]">Visual and audio guides to master complex topics.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" /> Generate Explainer
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeFilter === "all" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter("video")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${activeFilter === "video" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            <Video className="w-3 h-3" /> Videos
                        </button>
                        <button
                            onClick={() => setActiveFilter("audio")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${activeFilter === "audio" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                        >
                            <Mic2 className="w-3 h-3" /> Audio
                        </button>
                    </div>

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search explainers..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 pl-9 pr-4 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-[#1A1A1E] shadow-sm text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Explainers List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Fetching explainers...</p>
                </div>
            ) : filteredExplainers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-[#121214] border border-dashed border-slate-300 dark:border-slate-800 rounded-[32px]">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-primary/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold dark:text-white">No explainers found</h3>
                        <p className="text-slate-500 text-sm max-w-[250px]">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                </div>
            ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {filteredExplainers.map((exp) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                key={exp._id}
                                onClick={() => setSelectedExplainer(exp)}
                                className={`group cursor-pointer flex flex-col ${viewMode === "list" ? "flex-row h-32 bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden" : ""}`}
                            >
                                <div className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${viewMode === "list" ? "w-48 h-full shrink-0 rounded-none" : "aspect-video w-full mb-3"}`}>
                                    <img
                                        src={exp.thumbnail_url}
                                        alt={exp.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                            <Play className="w-5 h-5 fill-current" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-md text-[10px] font-bold text-white rounded">
                                        {formatDuration(exp.duration)}
                                    </div>
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        <div className="px-1.5 py-0.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-md flex items-center gap-1 shadow-md">
                                            {exp.tags.includes('audio') || exp.tags.includes('podcast') ? (
                                                <Mic2 className="w-2.5 h-2.5 text-primary" />
                                            ) : (
                                                <Video className="w-2.5 h-2.5 text-primary" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex flex-col ${viewMode === "list" ? "p-4 flex-1 justify-center" : "px-0.5"}`}>
                                    <h3 className="font-bold text-[13.5px] dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">{exp.name}</h3>

                                    <div className="flex flex-col text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        <p className="truncate">Shiksha GPT</p>
                                        <div className="flex items-center gap-1.5">
                                            <span>Just now</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-2.5 h-2.5" /> {exp.views_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedExplainer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedExplainer(null)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 md:inset-10 lg:inset-20 z-[101] flex flex-col items-center bg-black rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedExplainer(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="w-full flex-1 flex items-center justify-center bg-black">
                                <video
                                    src={selectedExplainer.video_url}
                                    className="max-h-full w-full object-contain"
                                    controls
                                    autoPlay
                                />
                            </div>
                            <div className="w-full bg-slate-900/50 backdrop-blur-md p-6 border-t border-white/10">
                                <div className="max-w-[1000px] mx-auto space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-xl md:text-2xl font-bold text-white">{selectedExplainer.name}</h2>
                                            <p className="text-slate-400 text-sm">{selectedExplainer.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">{selectedExplainer.views_count}</p>
                                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Views</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="text-right">
                                                <p className="text-white font-bold text-lg">{formatDuration(selectedExplainer.duration)}</p>
                                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Duration</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedExplainer.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Generate Explainer Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
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
                                        <h2 className="text-2xl font-bold dark:text-white">Generate Explainer</h2>
                                        <p className="text-slate-500 text-sm">Select options to create your visual guide</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
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
                                    onClick={handleGenerateExplainer}
                                    disabled={!selectedSubject || !selectedUnit || isGenerating}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Explainer...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Create Explainer
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
