import Link from "next/link";
import { Sparkles, Twitter, Github, Linkedin, Facebook } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="ShikshaGPT Logo" className="w-10 h-10" />
                            <span className="text-xl font-bold font-heading tracking-tight">
                                Shiksha<span className="text-gradient">GPT</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Empowering Nepali students through intelligent, personalized, and accessible AI tutoring.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-primary transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-primary transition-all">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-primary transition-all">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-primary transition-all">
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold font-heading mb-6 text-slate-900">Product</h4>
                        <ul className="space-y-4">
                            <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Curriculum</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold font-heading mb-6 text-slate-900">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold font-heading mb-6 text-slate-900">Legal</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 ShikshaGPT. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <p>Made with ❤️ for Learners.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
