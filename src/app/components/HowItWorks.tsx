"use client";

import { motion } from "framer-motion";
import { MessageSquare, Cpu, GraduationCap } from "lucide-react";

export const HowItWorks = () => {
    const steps = [
        {
            id: "01",
            title: "Ask Anything",
            desc: "Type your question, upload a problem, or describe what you want to learn. No question is too simple or complex.",
            icon: MessageSquare,
        },
        {
            id: "02",
            title: "AI Processes",
            desc: "Our AI analyzes your query, considers your learning history, and crafts a personalized response tailored to you.",
            icon: Cpu,
        },
        {
            id: "03",
            title: "Learn & Grow",
            desc: "Receive clear explanations, practice problems, and follow-up resources to master the topic completely.",
            icon: GraduationCap,
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-primary/3 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                        How It <span className="text-gradient">Works</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Three simple steps to transform your learning experience.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[70px] left-[15%] right-[15%] h-0.5 bg-[#d8691f]/50 " />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="flex flex-col items-center text-center group"
                            >
                                {/* Step ID Badge */}
                                <div className="mb-6 py-1 px-3 bg-indigo-50 text-[12px] text-[#d8691f] font-bold tracking-widest rounded-full shadow-sm border border-indigo-100">
                                    {step.id}
                                </div>

                                {/* Icon Box */}
                                <div className="mb-8 w-24 h-24 bg-white rounded-[2rem] shadow-xl border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative bg-linear-to-b from-white to-slate-50">
                                    <step.icon className="w-10 h-10 text-[#d8691f]" />
                                </div>

                                {/* Title & Text */}
                                <h3 className="text-xl font-bold font-heading mb-4 text-slate-900">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed max-w-[280px]">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

