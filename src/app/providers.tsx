"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const pathname = usePathname();
    const isAppRoute = pathname?.startsWith("/app");

    return (
        <NextThemesProvider
            {...props}
            forcedTheme={isAppRoute ? undefined : "light"}
        >
            {children}
        </NextThemesProvider>
    );
}
