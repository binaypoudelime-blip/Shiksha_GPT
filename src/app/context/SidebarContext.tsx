"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isOpen: boolean;
    toggle: () => void;
    setOpen: (open: boolean) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Persist sidebar state
    useEffect(() => {
        const stored = localStorage.getItem("sidebar_open");
        if (stored !== null) {
            setIsOpen(stored === "true");
        }
    }, []);

    const toggle = () => {
        setIsOpen((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebar_open", String(newState));
            return newState;
        });
    };

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        localStorage.setItem("sidebar_open", String(open));
    };

    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, setOpen, refreshTrigger, triggerRefresh }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
