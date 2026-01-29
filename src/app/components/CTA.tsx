import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const CTA = () => {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#9333EA]">
            {/* Decorative background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_60%)] -z-5 blur-3xl" />

            <div className="max-w-[1440px] mx-auto px-4 md:px-10 text-center relative z-10">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    {/* Top Icon Box */}
                    <div className="mb-10 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-4xl md:text-7xl font-bold font-heading text-white mb-8 leading-[1.1] tracking-tight">
                        Start Your Learning<br />Journey Today
                    </h2>

                    <p className="text-lg md:text-xl text-indigo-50 mb-12 max-w-2xl leading-relaxed opacity-90">
                        Join thousands of students who are already learning smarter, not harder.
                        Your personalized AI tutor is waiting.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full sm:w-auto">
                        <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all group shadow-xl">
                            Get Started Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
                            Contact Sales
                        </button>
                    </div>

                    {/* <p className="text-sm md:text-base text-white/70 font-medium">
                        No credit card required • Free forever plan available
                    </p> */}
                </div>
            </div>
        </section>
    );
};
