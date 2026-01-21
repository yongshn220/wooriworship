import { useLayoutEffect, useState, RefObject } from "react";

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
    const [anchorId, setAnchorId] = useState<string | null>(null);
    const [anchorOffset, setAnchorOffset] = useState(0);
    const prevItemsLength = useState({ current: itemsLength })[0];

    // Capture the first visible item as the anchor
    const captureAnchor = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const containerLeft = container.scrollLeft;

        // Iterate through item refs to find the first one that is visible
        // We can access the map directly
        const refs = itemRefs.current;
        if (!refs) return;

        for (const [id, element] of Array.from(refs.entries())) {
            // Check if element is largely within view or at least the first one
            // Simple logic: element's right edge is to the right of the container's left edge
            // And element's left edge is not too far right (implied by iteration order usually, but Map iteration order is insertion order)

            // Allow a small tolerance (e.g. 5px)
            if (element.offsetLeft + element.clientWidth > containerLeft + 5) {
                setAnchorId(id);
                // Calculate how far into the element we are scrolled (or how far the element is from left)
                // We want to preserve: element.offsetLeft - container.scrollLeft
                const offset = element.offsetLeft - containerLeft;
                setAnchorOffset(offset);
                console.log(`[Anchor] Captured ${id} at offset ${offset}`);
                break;
            }
        }
    };

    // Restore scroll position when items change
    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        const hasNewItems = itemsLength > prevItemsLength.current;

        if (container && anchorId && hasNewItems) {
            const element = itemRefs.current?.get(anchorId);
            if (element) {
                // Calculate new scroll position to keep the element at the same visual offset
                const newScrollLeft = element.offsetLeft - anchorOffset;

                // Disable smooth scrolling mechanisms for this frame
                container.style.scrollSnapType = "none";
                container.style.scrollBehavior = "auto";

                container.scrollLeft = newScrollLeft;

                console.log(`[Anchor] Restored to ${anchorId}, newScroll: ${newScrollLeft}`);

                // Restore snapping after paint
                requestAnimationFrame(() => {
                    container.style.scrollSnapType = "x mandatory";
                    container.style.scrollBehavior = "";
                    setAnchorId(null); // Reset anchor
                });
            } else {
                // Anchor was lost (shouldn't happen if ID persists), reset
                setAnchorId(null);
            }
        }

        prevItemsLength.current = itemsLength;
    }, [itemsLength, anchorId, anchorOffset, scrollContainerRef, itemRefs]);

    return {
        captureAnchor
    };
}
