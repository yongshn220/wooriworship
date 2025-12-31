"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useCardExpansion(itemId: string, defaultExpanded: boolean = false) {
    const searchParams = useSearchParams();
    const expandedId = searchParams.get("expanded");

    // If URL has expanded=itemId, force true initially.
    const [isExpanded, setIsExpanded] = useState(() => {
        if (expandedId === itemId) return true;
        return defaultExpanded;
    });

    // Auto-expand if URL param changes to match this ID (e.g. navigation)
    useEffect(() => {
        if (expandedId === itemId) {
            setIsExpanded(true);
        }
    }, [expandedId, itemId]);

    // Sync state with defaultExpanded prop
    useEffect(() => {
        setIsExpanded(defaultExpanded);
    }, [defaultExpanded]);

    const toggleExpand = () => setIsExpanded(prev => !prev);

    return {
        isExpanded,
        setIsExpanded,
        toggleExpand
    };
}
