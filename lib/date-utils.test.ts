import { parseLocalDate } from "./date-utils";

describe("date-utils", () => {
    describe("parseLocalDate", () => {
        it("parses YYYY-MM-DD correctly as local date", () => {
            const date = parseLocalDate("2023-12-25");
            expect(date.getFullYear()).toBe(2023);
            expect(date.getMonth()).toBe(11); // Month is 0-indexed
            expect(date.getDate()).toBe(25);
            // Verify hours are 00:00:00 local time implied by constructor
            expect(date.getHours()).toBe(0);
        });

        it("parses full ISO strings correctly", () => {
            // Assuming local time execution, hard to test exact ISO without mocking timezone, 
            // but checking basic validity
            const date = parseLocalDate("2023-12-25T10:00:00");
            expect(date.getFullYear()).toBe(2023);
            expect(isNaN(date.getTime())).toBe(false);
        });

        it("returns current date for empty input", () => {
            const now = new Date();
            const date = parseLocalDate("");
            // Allow small delta for execution time
            expect(Math.abs(date.getTime() - now.getTime())).toBeLessThan(100);
        });
    });
});
