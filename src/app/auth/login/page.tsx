"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, BookOpen, MessageSquare, BrainCircuit, FileText, Lightbulb, Layers, Calendar, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";


export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user info
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect to dashboard
                router.push("/app/dashboard");
            } else {
                setError(data.message || "Invalid email or password");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100 selection:text-primary overflow-hidden transition-colors duration-300">
            {/* Left Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-10 lg:p-12 relative overflow-y-auto bg-white dark:bg-slate-950">
                <Link
                    href="/"
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group z-20"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                <div className="max-w-md w-full mx-auto my-auto flex flex-col gap-6 lg:gap-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-6">
                        <img src="/logo.png" alt="ShikshaGPT Logo" className="w-16 h-16 hover:scale-110 transition-transform duration-300" />
                        <div className="space-y-1">
                            <h1 className="text-xl md:text-xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">
                                Welcome back to <span className="text-gradient">ShikshaGPT</span>
                            </h1>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">Your companion to learn smarter</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Your Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Your Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-300 dark:hover:bg-primary/90 hover:-translate-y-1 transition-all text-base tracking-wide mt-1 active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="space-y-4 text-center">
                        <p className="text-xs text-slate-400">
                            By logging in, you agree to our <Link href="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                        </p>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-slate-600">
                                Don't have an account? <Link href="/auth/signup" className="text-primary font-bold hover:underline">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Marketing */}
            <div className="hidden lg:flex w-1/2 bg-[#050510] relative overflow-hidden items-center justify-center p-12">
                {/* Modern Mesh Gradient / Aurora Background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Deep base glow */}
                    <div className="absolute inset-x-0 top-0 h-full bg-linear-to-b from-primary/10 to-transparent"></div>

                    {/* Floating vibrant blobs */}
                    <motion.div
                        animate={{
                            x: [0, 40, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[120px]"
                    ></motion.div>

                    <motion.div
                        animate={{
                            x: [0, -50, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"
                    ></motion.div>

                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[80px]"
                    ></motion.div>

                    {/* Subtle grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                </div>

                <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center gap-8">
                    {/* Glass box for stat */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass px-12 py-6 rounded-[40px] shadow-xl border border-white/20"
                    >
                        <h2 className="text-xl font-medium text-white/90 leading-tight tracking-wide">
                            88% of students get higher grades with <span className="font-bold text-white">ShikshaGPT</span>
                        </h2>
                    </motion.div>

                    {/* Flying Features Animation Section */}
                    <div className="relative w-full h-[400px] flex items-center justify-center">
                        <AnimatePresence>
                            {[
                                { icon: BookOpen, label: "Guided Learning", color: "bg-[#2DD4BF]", x: -180, y: -120, delay: 0 },
                                { icon: MessageSquare, label: "AI Chat Tutor", color: "bg-[#A855F7]", x: 160, y: -80, delay: 1 },
                                { icon: BrainCircuit, label: "Smart Quizzes", color: "bg-[#F59E0B]", x: -170, y: 40, delay: 2 },
                                { icon: Layers, label: "Flashcards", color: "bg-[#10B981]", x: 150, y: 110, delay: 3 },
                                { icon: FileText, label: "Summarizer", color: "bg-[#FB7185]", x: 30, y: -170, delay: 4 },
                                { icon: Lightbulb, label: "Explainers", color: "bg-[#EF4444]", x: -60, y: 160, delay: 5 },
                                { icon: Calendar, label: "Smart Calendar", color: "bg-[#0EA5E9]", x: 180, y: 40, delay: 6 },
                                { icon: Presentation, label: "Presentation Maker", color: "bg-[#6366F1]", x: -120, y: -180, delay: 7 },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                    animate={{
                                        opacity: [0, 1, 1, 0],
                                        scale: [0.5, 1, 1, 0.5],
                                        x: [0, feature.x, feature.x * 1.1, 0],
                                        y: [0, feature.y, feature.y * 1.1, 0],
                                    }}
                                    transition={{
                                        delay: feature.delay,
                                        duration: 8,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute"
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 2, -2, 0]
                                        }}
                                        transition={{
                                            duration: 3 + i,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="glass-dark px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl backdrop-blur-xl hover:bg-white/10 transition-colors cursor-default"
                                    >
                                        <div className={`${feature.color} p-2 rounded-lg shadow-lg`}>
                                            <feature.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-semibold text-sm tracking-tight whitespace-nowrap">{feature.label}</span>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Center Glow */}
                        <div className="absolute w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-l md:text-xl font-bold text-white leading-tight font-heading">
                                Your personal AI Tutor always with you.
                            </h3>
                            <p className="text-indigo-200/60 text-sm font-medium tracking-wide uppercase">
                                पाठ्यक्रम विकास केन्द्र (CDC) मा आधारित</p>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}

