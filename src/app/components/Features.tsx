"use client";

import { motion } from "framer-motion";
import {
    GraduationCap,
    MessageSquare,
    BrainCircuit,
    Layers,
    FileText,
    Lightbulb,
    Calendar,
    Presentation as PresentationIcon,
    BookOpen,
    ArrowRight
} from "lucide-react";

const features = [
    {
        title: "Guided Learning",
        desc: "Personalized learning paths tailored to your syllabus and pace. Master concepts step by step.",
        icon: BookOpen,
        color: "text-white",
        iconBg: "bg-[#2DD4BF]",
        hex: "#2DD4BF",
        cardBg: "from-[#F0FDFA] to-white",
        gridClass: "md:col-span-2 md:row-span-1",
    },
    {
        title: "AI Chat Tutor",
        desc: "Instant answers to your doubts with detailed, step-by-step explanations available 24/7.",
        icon: MessageSquare,
        color: "text-white",
        iconBg: "bg-[#A855F7]",
        hex: "#A855F7",
        cardBg: "from-[#FAF5FF] to-white",
        gridClass: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Smart Quizzes",
        desc: "Generate custom quizzes from any topic to test and reinforce your knowledge.",
        icon: BrainCircuit,
        color: "text-white",
        iconBg: "bg-[#F59E0B]",
        hex: "#F59E0B",
        cardBg: "from-[#FFFBEB] to-white",
        gridClass: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Summarizer",
        desc: "Turn long documents and articles into concise, easy-to-read summaries instantly.",
        icon: FileText,
        color: "text-white",
        iconBg: "bg-[#FB7185]",
        hex: "#FB7185",
        cardBg: "from-[#FFF1F2] to-white",
        gridClass: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Explainers",
        desc: "Complex concepts broken down into simple, understandable language with visual aids.",
        icon: Lightbulb,
        color: "text-white",
        iconBg: "bg-[#EF4444]",
        hex: "#EF4444",
        cardBg: "from-[#FEF2F2] to-white",
        gridClass: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Flashcards",
        desc: "Create and practice with AI-generated flashcards for better retention and recall.",
        icon: Layers,
        color: "text-white",
        iconBg: "bg-[#10B981]",
        hex: "#10B981",
        cardBg: "from-[#F0FDF4] to-white",
        gridClass: "md:col-span-1 md:row-span-2",
    },
    {
        title: "Smart Calendar",
        desc: "Organize your study schedule automatically based on your exam dates and workload.",
        icon: Calendar,
        color: "text-white",
        iconBg: "bg-[#0EA5E9]",
        hex: "#0EA5E9",
        cardBg: "from-[#F0F9FF] to-white",
        gridClass: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Presentation Maker",
        desc: "Generate professional study presentations and slides from your notes in seconds.",
        icon: PresentationIcon,
        color: "text-white",
        iconBg: "bg-[#6366F1]",
        hex: "#6366F1",
        cardBg: "from-[#EEF2FF] to-white",
        gridClass: "md:col-span-2 md:row-span-1",
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block opacity-60">Everything you need to excel</span>
                    <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight">
                        Supercharge Your <span className="text-gradient">Studies</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(220px,auto)]">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`${f.gridClass} p-8 rounded-[2.5rem] bg-gradient-to-br ${f.cardBg} border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start relative group overflow-hidden`}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute top-0 left-0 w-32 h-32 ${f.iconBg} opacity-[0.03] blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:opacity-10 transition-opacity`} />

                            <div className={`${f.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/5`}>
                                <f.icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold font-heading mb-3 text-slate-900 leading-tight">
                                {f.title}
                            </h3>

                            <p className="text-muted-foreground leading-relaxed text-base mb-6">
                                {f.desc}
                            </p>

                            <div className="mt-auto w-full flex justify-end">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 bg-slate-50 text-slate-400 group-hover:text-white"
                                    style={{
                                        backgroundColor: `${f.hex}15`,
                                        color: f.hex,
                                    } as any}
                                >
                                    <div
                                        className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-[var(--hover-bg)] group-hover:text-white"
                                        style={{ '--hover-bg': f.hex } as any}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
