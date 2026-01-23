import { useLayoutEffect, useState, useRef, RefObject } from "react";

interface UseAnchorScrollProps {
    scrollContainerRef: RefObject<HTMLDivElement>;
    itemsLength: number;
    // Map of item IDs to their DOM elements
    itemRefs: RefObject<Map<string, HTMLElement>>;
    isLoading: boolean;
}

export function useAnchorScroll({
    scrollContainerRef,
    itemsLength,
    itemRefs,
    isLoading
}: UseAnchorScrollProps) {
    const anchorIdRef = useRef<string | null>(null);
    const anchorOffsetRef = useRef(0);
    const prevItemsLength = useRef(itemsLength);

    // New: Flag to signal that we are currently restoring position
    // and the observer should be blocked
    const [isRestoring, setIsRestoring] = useState(false);

    // Capture the first visible item as the anchor
    const captureAnchor = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const containerLeft = container.scrollLeft;

        const refs = itemRefs.current;
        if (!refs) return;

        for (const [id, element] of Array.from(refs.entries())) {
            // Check if element is largely within view or at least the first one
            // Allow a small tolerance (e.g. 5px)
            if (element.offsetLeft + element.clientWidth > containerLeft + 5) {
                anchorIdRef.current = id;
                // Calculate visual offset
                const offset = element.offsetLeft - containerLeft;
                anchorOffsetRef.current = offset;
                // console.log(`[Anchor] Captured ${id} at offset ${offset}`);
                break;
            }
        }
    };

    // Restore scroll position when items change
    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        const hasNewItems = itemsLength > prevItemsLength.current;
        const anchorId = anchorIdRef.current;

        if (container && anchorId && hasNewItems) {
            const element = itemRefs.current?.get(anchorId);
            if (element) {
                // Signal interruption immediately
                setIsRestoring(true);

                // Calculate new scroll position
                const newScrollLeft = element.offsetLeft - anchorOffsetRef.current;

                // Disable smooth scrolling mechanisms for this frame
                container.style.scrollSnapType = "none";
                container.style.scrollBehavior = "auto";

                // CRITICAL: Kill interia/momentum
                container.style.overflowX = "hidden";

                container.scrollLeft = newScrollLeft;

                // console.log(`[Anchor] Restored to ${anchorId}, newScroll: ${newScrollLeft}`);

                // Restore snapping after paint
                requestAnimationFrame(() => {
                    container.style.scrollSnapType = "x mandatory";
                    container.style.scrollBehavior = "";
                    container.style.overflowX = "auto"; // Re-enable scrolling

                    anchorIdRef.current = null; // Reset anchor

                    // Unblock observer after a safe delay
                    // This prevents the observer from seeing the sentinel at the old position
                    setTimeout(() => {
                        setIsRestoring(false);
                    }, 100);
                });
            } else {
                anchorIdRef.current = null;
                setIsRestoring(false);
            }
        } else {
            // If no anchor or no new items, ensure we are not blocking
            if (!hasNewItems) {
                setIsRestoring(false);
            }
        }

        prevItemsLength.current = itemsLength;
    }, [itemsLength, scrollContainerRef, itemRefs]);

    return {
        captureAnchor,
        isRestoring
    };
}
