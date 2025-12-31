import React from "react";

/**
 * Normalizes text for search by removing special characters and converting to lowercase.
 */
export function normalizeText(text: string | null | undefined): string {
    return text?.replace(/[^a-zA-Z0-9가-힣]/g, "").toLowerCase() || "";
}

/**
 * Highlights a specific keyword within a text.
 * Returns a React node with a highlighted span if the keyword is found.
 */
export function highlightText(text: string | null | undefined, highlight: string): React.ReactNode | string {
    if (!text || text === "") return "";
    if (!highlight) return text;

    const normalizedText = normalizeText(text);
    const normalizedHighlight = normalizeText(highlight);

    if (normalizedText.includes(normalizedHighlight)) {
        // Note: We return the whole text wrapped for now as per the previous implementation's style.
        // If we want partial highlighting, we would need a more complex regex approach.
        return React.createElement("span", { className: "bg-yellow-200 rounded px-0.5" }, text);
    }
    return text;
}
