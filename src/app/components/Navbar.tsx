"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Adjust for sticky navbar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white py-3 shadow-md"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex items-center justify-between relative">
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="ShikshyaGPT Logo" className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                    <span className="text-xl font-bold font-heading tracking-tight">
                        Shiksha<span className="text-gradient">GPT</span>
                    </span>
                </Link>

                {/* Desktop Nav - Centered */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <a
                        href="#features"
                        onClick={(e) => scrollToSection(e, 'features')}
                        className="text-[15px] font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        onClick={(e) => scrollToSection(e, 'how-it-works')}
                        className="text-[15px] font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                    >
                        How it Works
                    </a>
                    <a
                        href="#testimonials"
                        onClick={(e) => scrollToSection(e, 'testimonials')}
                        className="text-[15px] font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                    >
                        Testimonials
                    </a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="text-[15px] font-semibold px-4 py-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700">
                            Sign In
                        </Link>
                        <Link href="/auth/signup" className="bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-200 transition-all">
                            Sign up Free
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 p-6 flex flex-col gap-4 md:hidden"
                    >
                        <a
                            href="#features"
                            onClick={(e) => scrollToSection(e, 'features')}
                            className="text-lg font-medium"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={(e) => scrollToSection(e, 'how-it-works')}
                            className="text-lg font-medium"
                        >
                            How it Works
                        </a>
                        <a
                            href="#testimonials"
                            onClick={(e) => scrollToSection(e, 'testimonials')}
                            className="text-lg font-medium"
                        >
                            Testimonials
                        </a>
                        <hr className="my-2" />
                        <Link href="/auth/login" className="w-full py-3 font-medium border border-slate-200 rounded-xl text-center" onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                        </Link>
                        <Link href="/app/dashboard" className="w-full py-3 font-medium bg-primary text-white rounded-xl text-center" onClick={() => setIsMobileMenuOpen(false)}>
                            Launch App
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
