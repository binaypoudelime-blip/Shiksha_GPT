"use client";

import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    GraduationCap,
    Building2,
    Camera,
    ShieldCheck,
    Bell,
    Lock,
    LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
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

    const userInitial = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : "??";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-[#121214] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-indigo-500/30">
                            {userInitial}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white capitalize">{user?.name || "Guest"}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Student Learner</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-100 dark:border-green-900/50 uppercase tracking-wider">Verified Account</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-primary/90 transition-all active:scale-95 text-sm">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white dark:bg-[#121214] rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-transparent">
                            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Personal Information
                            </h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem
                                icon={User}
                                label="Full Name"
                                value={user?.name || "Not provided"}
                            />
                            <InfoItem
                                icon={Mail}
                                label="Email Address"
                                value={user?.email || "Not provided"}
                            />
                            <InfoItem
                                icon={Phone}
                                label="Phone Number"
                                value={user?.contact || user?.phone || user?.phone_number || "Not provided"}
                            />
                            <InfoItem
                                icon={GraduationCap}
                                label="Current Grade"
                                value={user?.grade ? `Grade ${user.grade}` : "Not provided"}
                            />
                            <div className="md:col-span-2">
                                <InfoItem
                                    icon={Building2}
                                    label="Entity / School"
                                    value={user?.entity_info?.name || user?.entity_name || user?.school || user?.entity || "Not assigned"}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#121214] rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-transparent">
                            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Security & Account
                            </h2>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">Password</p>
                                        <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-primary hover:underline">Change</button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">Email Notifications</p>
                                        <p className="text-xs text-slate-500">Weekly progress reports</p>
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Stats/Actions */}
                <div className="space-y-6">
                    <section className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Learning Streak</h3>
                            <p className="text-indigo-100 text-sm mb-6">You're doing great!</p>
                            <div className="text-5xl font-black mb-2">12</div>
                            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Days Active</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    </section>

                    <section className="bg-white dark:bg-[#121214] rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Stats</h3>
                        <div className="space-y-6">
                            <StatMini label="Assignments" value="24" color="bg-blue-500" />
                            <StatMini label="Average Grade" value="88%" color="bg-green-500" />
                            <StatMini label="Quiz Score" value="A+" color="bg-purple-500" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</p>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all hover:border-primary/30">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</span>
            </div>
        </div>
    );
}

function StatMini({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <span className="text-sm font-bold dark:text-white">{value}</span>
        </div>
    );
}
