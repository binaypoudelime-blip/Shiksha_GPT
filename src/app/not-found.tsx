"use client";

import Link from "next/link";
import { MoveLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Visual element */}
                <div className="relative inline-block">
                    <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full" />
                    <h1 className="relative text-9xl font-bold font-heading text-slate-200 select-none animate-pulse">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 animate-bounce">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-bold font-heading text-slate-900 tracking-tight">
                        Page Not <span className="text-gradient">Found</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        Sorry, the page you are looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <MoveLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

                {/* Subtle breadcrumb/footer style info */}
                <div className="pt-12 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <span className="font-bold tracking-tight text-slate-300">
                        Shiksha<span className="text-indigo-300/50">GPT</span>
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span>Resource Not Found Error</span>
                </div>
            </div>
        </div>
    );
}
