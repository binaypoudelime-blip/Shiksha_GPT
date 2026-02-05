"use client";

import React from "react";
import {
    Play,
    Plus,
    MoreHorizontal,
    SearchCheck,
    BookOpen,
    Video,
    GraduationCap,
    Gamepad2,
    BrainCircuit,
    Upload,
    FileText,
    ChevronRight,
    Bookmark,
    Settings,
    Clock,
    SquareStack,
    Flame,
    StickyNote,
    X,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
    return (
        <div className="max-w-[1200px] mx-auto space-y-8">
            {/* Greeting */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden grayscale brightness-110">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-12 h-12" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white tracking-tight">
                        Good afternoon, binay poudel!
                    </h1>
                    <p className="text-slate-500 text-sm">Which study set are you working on today?</p>
                </div>
            </div>

            {/* Quick Access Sets */}
            <div className="flex flex-wrap gap-4">
                <div className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <SearchCheck className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">AI Digest</span>
                </div>

                <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="p-1.5 border border-dashed border-slate-400 dark:border-slate-600 rounded-lg group-hover:bg-primary/10 group-hover:border-primary transition-all">
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Add Set</span>
                </div>

                <div className="ml-auto hidden md:flex items-center gap-4">
                    <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <Plus className="w-4 h-4" /> Add Set
                    </button>
                    <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <BookOpen className="w-4 h-4" /> See All My Sets
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* Left Section: Active Set */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-primary dark:bg-indigo-600 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="p-8 pb-12 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-white/10 dark:bg-white/20 rounded-2xl">
                                        <SearchCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-2xl font-bold">AI Digest</h2>
                                        <p className="text-white/60 text-sm">2 materials</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-white/10 dark:bg-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 bg-white/10 dark:bg-white/20 text-white rounded-xl hover:bg-white/20 transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tool Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ToolCard icon={FileText} label="1 Tests/Quizzes" />
                                <ToolCard icon={Video} label="0 Explainers" />
                                <ToolCard icon={GraduationCap} label="0 Tutor Me" />
                                <ToolCard icon={Gamepad2} label="0 Arcade" />
                                <ToolCard icon={SquareStack} label="1 Flashcards" />
                                <ToolCard icon={BrainCircuit} label="0 Audio Recap" />
                            </div>

                            <button className="w-full bg-white text-primary font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg active:scale-95">
                                <div className="p-1 bg-primary/10 rounded-full">
                                    <Play className="w-4 h-4 fill-primary" />
                                </div>
                                Continue Learning
                            </button>
                        </div>

                        {/* Lessons List */}
                        <div className="bg-[#050510] dark:bg-[#050510] p-8 space-y-4">
                            <LessonItem title="Understanding the Anthropic AI Report and AUI" progress={0} />
                            <LessonItem title="India's AI Performance: The 0.27 Score Explained" progress={0} />
                            <LessonItem title="Implications and Future of AI for India" progress={0} />

                            <button className="w-full text-white/50 text-sm font-bold pt-4 hover:text-white transition-colors">View All</button>
                        </div>
                    </div>
                </div>

                {/* Right Section: Widgets */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Streak Widget */}
                    <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-xl">
                                    <Flame className="w-6 h-6 fill-current" />
                                </div>
                                <span className="font-bold text-lg dark:text-white">1 day streak!</span>
                            </div>
                            <button className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-primary transition-colors">View Leaderboard</button>
                        </div>
                    </div>

                    <StickyNotes />

                    {/* Materials Widget */}
                    <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold dark:text-white">Materials</h3>
                            <button className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 dark:text-white hover:bg-primary/10 hover:border-primary hover:text-primary transition-all">
                                <Plus className="w-3.5 h-3.5" /> Upload
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-10 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden grayscale opacity-50">
                                    <FileText className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors">Untitled Lecture</p>
                                    <p className="text-[10px] text-slate-400">Jan 5, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                    <Video className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors line-clamp-1">Anthropic Report: India's Shocking AI Scor...</p>
                                    <p className="text-[10px] text-slate-400">Dec 31, 2025</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full text-center text-primary text-xs font-bold hover:underline">View All</button>
                    </div>

                    {/* Upcoming Widget */}
                    <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <h3 className="font-bold dark:text-white">Upcoming</h3>
                            </div>
                            <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg"><ChevronRight className="w-4 h-4 rotate-90" /></button>
                        </div>
                        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 font-medium">No upcoming events</p>
                        </div>
                        <button className="w-full text-center text-primary text-xs font-bold hover:underline">View All</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolCard({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/10 dark:bg-white/20 border border-white/10 dark:border-white/20 rounded-2xl group cursor-pointer hover:bg-white/20 transition-all">
            <div className="flex items-center gap-3 text-white">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors rotate-90" />
        </div>
    );
}

function StickyNotes() {
    const [notes, setNotes] = React.useState<any[]>([]);
    const [newNote, setNewNote] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editingText, setEditingText] = React.useState("");

    const colors = [
        "bg-yellow-100 dark:bg-yellow-900/20",
        "bg-blue-100 dark:bg-blue-900/20",
        "bg-green-100 dark:bg-green-900/20",
        "bg-pink-100 dark:bg-pink-900/20",
        "bg-purple-100 dark:bg-purple-900/20"
    ];

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/todos/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNotes();
    }, []);

    const addNote = async () => {
        if (!newNote.trim()) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("https://shiksha-gpt.com/api/todos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text: newNote })
            });

            if (response.ok) {
                setNewNote("");
                fetchNotes(); // Refresh list as requested
            }
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/todos/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotes(notes.filter(n => n._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    const updateNote = async (id: string, text: string, completed: boolean) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/todos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: text,
                    completed: completed
                })
            });

            if (response.ok) {
                const updated = await response.json();
                setNotes(notes.map(n => n._id === id ? updated : n));
                setEditingId(null);
            }
        } catch (error) {
            console.error("Failed to update note", error);
        }
    };

    const toggleComplete = async (note: any) => {
        updateNote(note._id, note.text, !note.completed);
    };

    const startEditing = (note: any) => {
        setEditingId(note._id);
        setEditingText(note.text);
    };

    return (
        <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-primary" />
                    <h3 className="font-bold dark:text-white">Sticky Notes</h3>
                </div>
                <button
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="p-1 px-2.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                >
                    <Plus className="w-3 h-3" /> Add
                </button>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Type a note and press enter..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30 dark:text-white transition-all"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {notes.map((note, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={{
                                    layout: { duration: 0.2, ease: "easeOut" },
                                    opacity: { duration: 0.15 }
                                }}
                                key={note._id}
                                className={`${colors[index % colors.length]} p-3 rounded-2xl relative group border border-black/5 dark:border-white/5 shadow-sm ${note.completed ? 'opacity-60' : ''}`}
                            >
                                <AnimatePresence mode="wait">
                                    {editingId === note._id ? (
                                        <motion.div
                                            key="editing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-2"
                                            layout
                                        >
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onFocus={(e) => {
                                                    const val = e.target.value;
                                                    e.target.value = "";
                                                    e.target.value = val;
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        updateNote(note._id, editingText, note.completed);
                                                    }
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-primary/30 dark:text-white resize-none"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-[10px] text-slate-500 font-bold hover:text-slate-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => updateNote(note._id, editingText, note.completed)}
                                                    className="text-[10px] text-primary font-bold hover:underline"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="viewing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-3"
                                            layout
                                        >
                                            <button
                                                onClick={() => toggleComplete(note)}
                                                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-md border-2 transition-colors flex items-center justify-center ${note.completed
                                                    ? 'bg-primary border-primary'
                                                    : 'border-black/10 dark:border-white/20'
                                                    }`}
                                            >
                                                {note.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </button>
                                            <p
                                                onClick={() => startEditing(note)}
                                                className={`flex-1 text-xs font-medium dark:text-slate-200 pr-6 leading-relaxed cursor-text ${note.completed ? 'line-through text-slate-500' : ''}`}
                                            >
                                                {note.text}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNote(note._id);
                                                }}
                                                className="absolute top-3 right-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                {!isLoading && notes.length === 0 && (
                    <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-medium">No notes yet. Add one above!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LessonItem({ title, progress }: { title: string, progress: number }) {
    return (
        <div className="flex items-center justify-between gap-6 py-2 group cursor-pointer">
            <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{title}</span>
            <div className="flex items-center gap-4 min-w-[120px]">
                <div className="flex-1 h-2 bg-white/10 dark:bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-white font-bold text-xs min-w-[24px]">{progress}%</span>
            </div>
        </div>
    );
}

