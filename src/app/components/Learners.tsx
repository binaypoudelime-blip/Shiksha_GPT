"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Users, Layout, GraduationCap, Zap } from "lucide-react";

const learnersFeature = [
    {
        title: "Adaptive Learning Paths",
        desc: "Personalized Study plans that adapt to your unique learning style and pace.",
        icon: Target,
        color: "bg-blue-50 text-blue-600",
    },
    {
        title: "Instant Doubt Solving",
        desc: "Get immediate explanations for complex problems in the Nepali syllabus.",
        icon: Zap,
        color: "bg-purple-50 text-purple-600",
    },
    {
        title: "Global Knowledge Base",
        desc: "Access a vast library of resources curated for local curriculum needs.",
        icon: BookOpen,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        title: "Smart Summaries",
        desc: "Condense long chapters into bite-sized, easy-to-digest study notes.",
        icon: Layout,
        color: "bg-orange-50 text-orange-600",
    },
    {
        title: "Goal Tracking",
        desc: "Set and achieve academic milestones with our intelligent progress monitor.",
        icon: GraduationCap,
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        title: "Collaborative Learning",
        desc: "Connect with peers and learn together in a supportive digital environment.",
        icon: Users,
        color: "bg-pink-50 text-pink-600",
    },
];

export const Learners = () => {
    return (
        <section id="learners" className="py-24 bg-[#FCFCFD]">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Built for <span className="text-gradient">Learners</span></h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Our platform brings together the best of AI and education to give you an edge in your studies.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {learnersFeature.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all"
                        >
                            <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-6`}>
                                <f.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold font-heading mb-3">{f.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
