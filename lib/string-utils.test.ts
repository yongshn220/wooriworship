import { normalizeText, highlightText } from "./string-utils";
import React from "react";

describe("strint-utils", () => {
    describe("normalizeText", () => {
        it("removes special characters and converts to lowercase", () => {
            expect(normalizeText("Hello, World!")).toBe("helloworld");
            expect(normalizeText("  Space  ")).toBe("space");
            expect(normalizeText("한글 Test!")).toBe("한글test");
        });

        it("handles empty or null inputs", () => {
            expect(normalizeText("")).toBe("");
            expect(normalizeText(null)).toBe("");
            expect(normalizeText(undefined)).toBe("");
        });
    });

    describe("highlightText", () => {
        it("returns original text if keyword is empty", () => {
            expect(highlightText("Hello", "")).toBe("Hello");
        });

        it("returns original text if input is empty", () => {
            expect(highlightText("", "test")).toBe("");
            expect(highlightText(null, "test")).toBe("");
        });

        it("wraps text in span if keyword matches (case-insensitive)", () => {
            const result = highlightText("Hello World", "hello");
            // Since it returns a React element, we check its props
            expect(React.isValidElement(result)).toBe(true);
            expect((result as React.ReactElement).props.className).toContain("bg-yellow-200");
            expect((result as React.ReactElement).props.children).toBe("Hello World");
        });

        it("returns plain text if keyword does not match", () => {
            expect(highlightText("Hello", "World")).toBe("Hello");
        });
    });
});
