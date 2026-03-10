"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };

        // Check initial state
        if (!navigator.onLine) setIsOffline(true);

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    if (!isOffline && !showReconnected) return null;

    return (
        <div
            className={cn(
                "fixed top-[env(safe-area-inset-top)] left-0 right-0 z-2000 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold transition-all duration-300",
                isOffline
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500 text-white animate-in fade-in slide-in-from-top-2"
            )}
        >
            {isOffline ? (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline — showing cached data
                </>
            ) : (
                "Back online"
            )}
        </div>
    );
}
