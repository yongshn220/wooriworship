import { cn, valuesInAButNotInB } from "./utils";

describe("utils", () => {
    describe("cn", () => {
        it("merges class names correctly", () => {
            expect(cn("c1", "c2")).toBe("c1 c2");
            expect(cn("c1", { c2: true, c3: false })).toBe("c1 c2");
        });

        it("handles tailwind conflicts", () => {
            expect(cn("p-4", "p-2")).toBe("p-2");
            expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
        });
    });

    describe("valuesInAButNotInB", () => {
        it("returns elements in A not in B", () => {
            const A = [1, 2, 3, 4];
            const B = [3, 4, 5];
            expect(valuesInAButNotInB(A, B)).toEqual([1, 2]);
        });

        it("returns all of A if B is empty", () => {
            expect(valuesInAButNotInB([1, 2], [])).toEqual([1, 2]);
        });

        it("returns empty array if A is empty", () => {
            expect(valuesInAButNotInB([], [1, 2])).toEqual([]);
        });
    });
});
