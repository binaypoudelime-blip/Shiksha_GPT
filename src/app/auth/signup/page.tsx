"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, GraduationCap, Phone, Info, AlertCircle, BookOpen, MessageSquare, BrainCircuit, FileText, Lightbulb, Layers, Calendar, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        grade: "",
        contactNumber: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
        if (!formData.grade) newErrors.grade = "Grade is required";
        if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";

        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form submitted successfully", formData);
            // Proceed with signup logic
        }
    };

    return (
        <div className="flex h-screen bg-white selection:bg-indigo-100 selection:text-primary overflow-hidden">
            {/* Left Side: Signup Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-10 lg:p-12 relative overflow-y-auto">
                <Link
                    href="/"
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group z-20"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-medium">Back to Home</span>
                </Link>

                <div className="max-w-md w-full mx-auto my-auto flex flex-col gap-6 lg:gap-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-6 pt-12 lg:pt-0">
                        <img src="/logo.png" alt="ShikshaGPT Logo" className="w-16 h-16 hover:scale-110 transition-transform duration-300" />
                        <div className="space-y-1">
                            <h1 className="text-lg md:text-lg font-bold font-heading tracking-tight text-slate-900">
                                Create your <span className="text-gradient">ShikshaGPT</span> account
                            </h1>
                            <p className="text-slate-500 text-xs">Join thousands of students learning smarter</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border ${errors.fullName ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-xs`}
                                />
                            </div>
                            {errors.fullName && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-700 ml-1">Your Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-xs`}
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.email}</p>}

                            {/* edu email tip */}
                            <div className="mt-2 flex items-center gap-1.5 ml-1">
                                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    <span className="font-medium text-slate-600">Tip:</span> Got an <span className="font-semibold text-indigo-600">.edu email</span>? You might qualify for free premium!
                                </p>
                            </div>
                        </div>

                        {/* Password & Confirm Password Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        className={`w-full pl-12 pr-12 py-2.5 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-xs`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm"
                                        className={`w-full pl-12 pr-12 py-2.5 bg-slate-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-xs`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Grade & Contact Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 ml-1">Grade</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border ${errors.grade ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-sm appearance-none cursor-pointer`}
                                    >
                                        <option value="">Select Grade</option>
                                        <option value="1">Grade 1</option>
                                        <option value="2">Grade 2</option>
                                        <option value="3">Grade 3</option>
                                        <option value="4">Grade 4</option>
                                        <option value="5">Grade 5</option>
                                        <option value="6">Grade 6</option>
                                        <option value="7">Grade 7</option>
                                        <option value="8">Grade 8</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                </div>
                                {errors.grade && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.grade}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 ml-1">Contact Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        placeholder="Phone number"
                                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border ${errors.contactNumber ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 text-xs`}
                                    />
                                </div>
                                {errors.contactNumber && <p className="text-[10px] text-red-500 ml-1 font-medium">{errors.contactNumber}</p>}
                            </div>
                        </div>

                        <button className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-1 transition-all text-sm tracking-wide mt-4 active:scale-95 cursor-pointer">
                            Create Account
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="space-y-4 text-center">
                        <p className="text-[10px] text-slate-400">
                            By signing up, you agree to our <Link href="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                        </p>

                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] text-slate-600">
                                Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Marketing (Exact same as login) */}
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
