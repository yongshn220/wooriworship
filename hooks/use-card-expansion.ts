"use client";

import { useState, useEffect } from "react";

export function useCardExpansion(itemId: string, defaultExpanded: boolean = false) {
    // URL param logic removed

    // Initialize with default expanded state
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Sync state with defaultExpanded prop (still useful for lists controlling children)
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
