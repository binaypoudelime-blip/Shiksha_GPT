"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export const Hero = () => {
    const words = ["Students", "Teachers", "Schools"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-20 md:pt-25 md:pb-30 overflow-hidden">
            {/* Side-framing Mesh Gradient */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Left Side Glow - Animates between Indigo and Purple */}
                <motion.div
                    animate={{
                        backgroundColor: ["#A5B4FC", "#D8B4FE", "#f0cb93ff", "#9cf1e9ff"],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[5%] -left-[25%] w-[45%] h-[80%] rounded-full blur-[100px] md:blur-[150px] opacity-60"
                />

                {/* Right Side Glow - Animates between Purple and Indigo */}
                <motion.div
                    animate={{
                        backgroundColor: ["#A5B4FC", "#D8B4FE", "#f0cb93ff", "#9cf1e9ff"],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[5%] -right-[25%] w-[45%] h-[80%] rounded-full blur-[100px] md:blur-[150px] opacity-60"
                />
                {/* Subtle bottom connection */}
                <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-blue-50/50 blur-[120px]" />

                {/* Clean white center gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block p-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-10 shadow-lg shadow-indigo-100/50">
                        <div className="inline-flex items-center gap-x-2.5 py-2 px-5 bg-white backdrop-blur-md text-indigo-700 text-[10px] md:text-xs font-extrabold tracking-[0.15em] uppercase rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="shrink-0">Nepal's First AI Platform For</span>
                            <div className="h-6 overflow-hidden flex items-center min-w-[80px] md:min-w-[100px]">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={words[index]}
                                        initial={{ y: 15, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -15, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="block font-black text-indigo-800 text-[11px] md:text-sm"
                                    >
                                        {words[index]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold font-heading mb-6 tracking-tight leading-[1.1]">
                        Master Knowledge<br />
                        <span className="text-gradient">Faster.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        ShikshaGPT bridges the gap between personalized AI tutoring for students in K-12 and institutional standards.पाठ्यक्रम विकास केन्द्र (CDC) मा आधारित. Learn freely, but stay on track.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/signup" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-200 transition-all group">
                            Get Started Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="w-full sm:w-auto bg-white border border-primary/5 text-slate-900 px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                            <div className="bg-indigo-100 p-1 rounded-full">
                                <Play className="w-3 h-3 text-primary fill-current" />
                            </div>
                            Watch Demo
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
