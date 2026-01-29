"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
    {
        name: "Arjun K.",
        role: "SEE Student",
        text: "ShikshaGPT helped me understand Science concepts that I was struggling with for months. The explanations are so clear!",
        rating: 5,
    },
    {
        name: "Priya S.",
        role: "Grade 11 Student",
        text: "The smart summaries are a lifesaver for Economics. It saves me so much time during revision.",
        rating: 5,
    },
    {
        name: "Rajesh M.",
        role: "Parent",
        text: "My son's grades have improved significantly since he started using ShikshaGPT for his math practice.",
        rating: 5,
    },
    {
        name: "Sita G.",
        role: "Grade 10 Student",
        text: "I love how it knows exactly what's in our Nepali curriculum. It's like having a tutor 24/7.",
        rating: 5,
    },
    {
        name: "Binod T.",
        role: "SEE Candidate",
        text: "The best tool for mock test preparation. The instant doubt solving is just amazing.",
        rating: 5,
    },
    {
        name: "Anjali P.",
        role: "Student",
        text: "Highly recommended for anyone looking to master their syllabus efficiently.",
        rating: 5,
    },
];

export const Testimonials = () => {
    return (
        <section id="testimonials" className="py-24 bg-[#FCFCFD]">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Loved by <span className="text-gradient">Students</span></h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Join thousands of students who are already excelling with ShikshaGPT.
                    </p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {reviews.map((r, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(r.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-slate-700 italic mb-6 leading-relaxed">"{r.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-primary font-heading uppercase">
                                    {r.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{r.name}</h4>
                                    <p className="text-xs text-muted-foreground">{r.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
