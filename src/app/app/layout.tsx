"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    MessageSquare,
    Video,
    SquareStack,
    Trophy,
    GraduationCap,
    Gamepad2,
    PenTool,
    Film,
    Mic2,
    FileText,
    Upload,
    Search,
    Bell,
    ChevronRight,
    SearchCheck,
    Menu,
    X,
    Sun,
    Moon,
    Flame,
    Settings,
    LogOut,
    User,
    Phone,
    Building2,
    ShieldCheck,
    Mail,
    History as HistoryIcon,
    HelpCircle,
    ListChecks
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

const navItems = [
    { icon: Calendar, label: "Calendar", href: "/app/calendar", color: "text-rose-500", bgColor: "bg-rose-500/10" },
    { icon: SquareStack, label: "Flashcards", href: "/app/flashcards", color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { icon: HelpCircle, label: "Quizzes", href: "/app/quizzes", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { icon: BookOpen, label: "Summarizer", href: "/app/summarizer", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: GraduationCap, label: "Tutor Me", href: "/app/tutor", color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { icon: ListChecks, label: "Practice Test", href: "/app/practice-test", color: "text-pink-500", bgColor: "bg-pink-500/10" },
    { icon: Film, label: "Explainers", href: "/app/explainers", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { icon: FileText, label: "Notes & Resources", href: "/app/notes", color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    { icon: MessageSquare, label: "Shiksha.E (Chat)", href: "/app/chat", color: "text-fuchsia-500", bgColor: "bg-fuchsia-500/10" },
];

function HistoryItem({ conv, urlId, onClick }: { conv: any, urlId: string | null, onClick?: () => void }) {
    const [isTruncated, setIsTruncated] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);
    const textRef = useRef<HTMLSpanElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const checkTruncation = () => {
        if (textRef.current) {
            setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    };

    const handleMouseEnter = () => {
        if (linkRef.current) {
            const rect = linkRef.current.getBoundingClientRect();
            // Position tooltip with less offset and better vertical alignment
            setCoords({ top: rect.top + 2, left: rect.right + 8 });
        }
        checkTruncation();
        setShowTooltip(true);
    };

    const tooltipContent = (
        <AnimatePresence>
            {showTooltip && isTruncated && (
                <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999
                    }}
                    className="max-w-[350px] w-max p-2.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-[10px] rounded-lg shadow-2xl border border-slate-700/50 dark:border-slate-600/50 pointer-events-none"
                >
                    {/* Compact Triangle Arrow */}
                    <div className="absolute right-full top-2 -mr-[1px] border-[5px] border-transparent border-r-slate-900/95 dark:border-r-slate-800/95" />

                    <p className="whitespace-pre-wrap break-words leading-snug font-medium">
                        {conv.title || "Untitled Chat"}

                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative group/history-item">
            <Link
                ref={linkRef}
                href={`/app/chat?id=${conv._id}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={onClick}
                className={`block px-2 py-1.5 rounded-md text-[11px] transition-colors truncate font-medium ${urlId === conv._id
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary"
                    }`}
            >
                <span ref={textRef} className="block truncate">
                    {conv.title || "Untitled Chat"}
                </span>
            </Link>

            {mounted && typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
        </div>
    );
}

function NavItem({ item, isSidebarOpen, pathname, onClick }: { item: any, isSidebarOpen: boolean, pathname: string, onClick?: () => void }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);
    const itemRef = useRef<HTMLAnchorElement>(null);
    const Icon = item.icon;

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = () => {
        if (!isSidebarOpen && itemRef.current && window.innerWidth >= 1024) {
            const rect = itemRef.current.getBoundingClientRect();
            setCoords({ top: rect.top + rect.height / 2, left: rect.right + 12 });
            setShowTooltip(true);
        }
    };

    return (
        <>
            <Link
                ref={itemRef}
                href={item.href}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={onClick}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group relative ${pathname === item.href
                    ? `${item.bgColor}`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
            >
                {Icon && (
                    <Icon className={`w-4 h-4 shrink-0 transition-all duration-300 ${item.color} ${pathname === item.href
                        ? "scale-110 opacity-100"
                        : "opacity-60 group-hover:opacity-100 group-hover:scale-110"
                        }`} />
                )}
                {isSidebarOpen && (
                    <span className={`text-[13px] font-semibold leading-none truncate transition-all duration-300 ${pathname === item.href ? item.color : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}>
                        {item.label}
                    </span>
                )}
            </Link>

            {mounted && !isSidebarOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, x: -8, y: "-50%", scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
                            exit={{ opacity: 0, x: -8, y: "-50%", scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                zIndex: 9999
                            }}
                            className="px-3 py-1.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-[11px] font-bold rounded-lg shadow-xl pointer-events-none whitespace-nowrap border border-slate-700/50 dark:border-slate-600/50"
                        >
                            {item.label}
                            {/* Tiny Triangle Arrow */}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-slate-900/95 dark:border-r-slate-800/95" />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <React.Suspense fallback={null}>
                <AppContent>{children}</AppContent>
            </React.Suspense>
        </SidebarProvider>
    );
}

function AppContent({ children }: { children: React.ReactNode }) {
    const { isOpen: isSidebarOpen, toggle: toggleSidebar, refreshTrigger } = useSidebar();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlId = searchParams.get("id");
    const { theme, setTheme } = useTheme();

    const fetchConversations = async (userId: string) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`https://shiksha-gpt.com/api/conversations/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    React.useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                const userId = parsedUser._id || parsedUser.id || parsedUser.user_id || "688c489cdb3cdc055588e6a3";
                fetchConversations(userId);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, [pathname, refreshTrigger]);

    const userInitial = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : "??";

    const handleSignOut = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0A0A0B] transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen
                    ? "translate-x-0 w-64 lg:w-52"
                    : "-translate-x-full lg:translate-x-0 w-64 lg:w-16"
                    } fixed top-0 left-0 lg:relative flex flex-col bg-white dark:bg-[#121214] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 lg:z-30 h-full`}
            >
                {/* Brand Section (Top of Sidebar) */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-transparent">
                    <Link
                        href="/app/dashboard"
                        onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                        className="flex items-center overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group/brand"
                    >
                        <img src="/logo.png" alt="Logo" className="w-[26px] h-[26px] shrink-0 group-hover/brand:scale-110 transition-transform" />
                        {isSidebarOpen && (
                            <span className="ml-2.5 font-bold text-sm dark:text-white tracking-tight whitespace-nowrap">ShikshaGPT</span>
                        )}
                    </Link>
                    {isSidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <React.Fragment key={index}>
                                {item.href === "/app/chat" && (
                                    <div className="mx-2 my-2 border-t border-slate-200 dark:border-slate-800" />
                                )}
                                <NavItem item={item} isSidebarOpen={isSidebarOpen} pathname={pathname} onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }} />

                                {/* Conversation History Section */}
                                {(item.href === "/app/chat" || item.label.includes("Chat")) && isSidebarOpen && (
                                    <div className="mt-2 mb-4 -mr-2 space-y-1">
                                        <div className="flex items-center gap-2 px-4 py-1 mb-1">
                                            <HistoryIcon className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">History</span>
                                        </div>
                                        <div className="max-h-[35vh] overflow-y-auto space-y-0.5">
                                            {conversations.length > 0 ? (
                                                conversations.slice(0, 20).map((conv) => (
                                                    <HistoryItem
                                                        key={conv._id}
                                                        conv={conv}
                                                        urlId={urlId}
                                                        onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                                                    />
                                                ))
                                            ) : (
                                                <p className="px-2 py-1.5 text-[10px] text-slate-400 italic">No recent chats</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-[#121214] border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
                    <div className="flex items-center gap-2 flex-1">
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative max-w-md w-full hidden md:block ml-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-full border border-orange-100 dark:border-orange-900/50">
                            <Flame className="w-4 h-4 fill-orange-600" />
                            <span className="text-xs font-bold">1</span>
                        </div>

                        <div className="relative group/theme">
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors min-w-[40px] flex items-center justify-center"
                            >
                                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                            </button>

                            {/* Theme Tooltip/Toast */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/theme:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover/theme:translate-y-0 z-50">
                                <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                                    Theme
                                </div>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                            </div>
                        </div>

                        <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#121214]"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 pl-3 ml-3 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 px-2 rounded-xl transition-all"
                            >
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-bold dark:text-white">{user?.name || "Guest"}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.grade ? `Grade ${user.grade}` : "Standard Student"}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none">
                                    {userInitial}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        ></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Account</p>
                                                <div className="flex items-center gap-3 px-2 py-1">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {userInitial}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold dark:text-white truncate">{user?.name || "Guest"}</p>
                                                        <p className="text-[10px] text-slate-500 truncate">{user?.email || "No email"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2">
                                                <Link
                                                    href="/app/profile"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                                    <span>Profile Settings</span>
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors group"
                                                >
                                                    <LogOut className="w-4 h-4 text-red-500" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
