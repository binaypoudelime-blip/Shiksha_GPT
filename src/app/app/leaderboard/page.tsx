"use client";

import React, { useState, useEffect } from "react";
import {
    Trophy,
    Users,
    Flame,
    School,
    Search,
    ChevronRight,
    Loader2,
    Medal,
    Star,
    LayoutGrid,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";

interface LeaderboardEntry {
    _id: string;
    user_id: string;
    entity_id: string | null;
    username: string;
    avatar_url: string | null;
    total_xp: number;
    weekly_xp: number;
    monthly_xp: number;
    quizzes_completed: number;
    practice_sets_completed: number;
    questions_solved: number;
    current_rank: number;
    last_active: string;
}

type TabType = "school" | "global" | "streak";

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>("school");
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    useEffect(() => {
        if (activeTab === "streak") {
            setLeaderboardData([]);
            setIsLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                const entityId = user?.entity_id || user?.entity_info?._id || user?.entity_info?.id;
                let url = `${API_BASE_URL}/api/leaderboard/global?limit=50`;

                if (activeTab === "school") {
                    if (entityId) {
                        url = `${API_BASE_URL}/api/leaderboard/entity/${entityId}?limit=50`;
                    } else {
                        setIsLoading(false);
                        setLeaderboardData([]);
                        return;
                    }
                }

                const response = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLeaderboardData(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab !== "school" || (activeTab === "school" && user)) {
            fetchLeaderboard();
        }
    }, [activeTab, user]);

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-20 -mt-2 md:-mt-4">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href="/app/dashboard"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors text-sm font-bold w-fit"
                >
                    <History className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black dark:text-white tracking-tight flex items-center gap-2">
                            <Trophy className="w-7 h-7 text-amber-500" />
                            Study Leaders
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">See how you stack up against other learners.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
                <TabButton
                    active={activeTab === "school"}
                    onClick={() => setActiveTab("school")}
                    icon={School}
                    label="School Leaderboard"
                />
                <TabButton
                    active={activeTab === "global"}
                    onClick={() => setActiveTab("global")}
                    icon={Users}
                    label="Global Leaderboard"
                />
                <TabButton
                    active={activeTab === "streak"}
                    onClick={() => setActiveTab("streak")}
                    icon={Flame}
                    label="Streak Hall of Fame"
                />
            </div>

            {/* List Section */}
            <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-slate-500 font-bold">Loading leaderboard...</p>
                    </div>
                ) : activeTab === "streak" ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-10">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center">
                            <Flame className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black dark:text-white">Streak Hall of Fame</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Coming soon! We're preparing the most dedicated learners' portal. Stay tuned!</p>
                    </div>
                ) : leaderboardData.length === 0 ? (activeTab === "school" && !(user?.entity_id || user?.entity_info?._id || user?.entity_info?.id) ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-10">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center">
                            <School className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black dark:text-white">Not Enrolled in a School</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Update your profile to join your school's leaderboard and compete with your classmates.</p>
                        <Link href="/app/profile" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl mt-2">Go to Profile</Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-10">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400">
                            <LayoutGrid className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black dark:text-white">No entries found</h2>
                        <p className="text-slate-500">The leaderboard is currently empty. Be the first to earn XP!</p>
                    </div>
                )) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        <div className="grid grid-cols-[80px_1fr_120px_120px] items-center px-8 py-4 bg-slate-50/50 dark:bg-white/5 sticky top-0 z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">XP</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Stats</span>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {leaderboardData.map((entry, index) => (
                                <LeaderboardRow key={entry._id} entry={entry} isCurrentUser={entry.user_id === user?._id} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold dark:text-white text-sm">How to earn points?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Complete quizzes, practice tests, and daily study sessions to earn XP and move up the ranks.</p>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${active
                ? "bg-white dark:bg-[#1A1A1E] text-primary shadow-sm dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
        >
            <Icon className={`w-3.5 h-3.5 ${active ? "text-primary dark:text-white" : ""}`} />
            {label}
        </button>
    );
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry, isCurrentUser: boolean }) {
    const rank = entry.current_rank;

    const getRankStyles = () => {
        if (rank === 1) return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
        if (rank === 2) return "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700/50";
        if (rank === 3) return "bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/50";
        return "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400 border-slate-100 dark:border-white/10";
    };

    const getIcon = () => {
        if (rank === 1) return <Medal className="w-4 h-4" />;
        if (rank === 2) return <Medal className="w-4 h-4" />;
        if (rank === 3) return <Medal className="w-4 h-4" />;
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`grid grid-cols-[80px_1fr_120px_120px] items-center px-8 py-5 transition-colors ${isCurrentUser ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary" : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
        >
            {/* Rank */}
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border ${getRankStyles()}`}>
                    {rank}
                </div>
                {getIcon()}
            </div>

            {/* User */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        entry.username[0].toUpperCase()
                    )}
                </div>
                <div>
                    <p className="font-bold dark:text-white text-sm flex items-center gap-2">
                        {entry.username}
                        {isCurrentUser && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider font-black">You</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Level {Math.floor(entry.total_xp / 100) + 1} Learner
                    </p>
                </div>
            </div>

            {/* XP */}
            <div className="text-center">
                <div className="text-lg font-black text-primary dark:text-indigo-400 leading-none mb-1">
                    {entry.total_xp.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Quizzes:</span>
                    <span className="text-xs font-black dark:text-white">{entry.quizzes_completed}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Sets:</span>
                    <span className="text-xs font-black dark:text-white">{entry.practice_sets_completed}</span>
                </div>
            </div>
        </motion.div>
    );
}
