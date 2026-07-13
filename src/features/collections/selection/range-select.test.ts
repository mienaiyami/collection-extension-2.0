import { describe, expect, it } from "vitest";
import { applyRangeSelection, pruneSelectionToVisible } from "./range-select";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}` as UUID;

describe("applyRangeSelection", () => {
    const ordered = [id(1), id(2), id(3), id(4)];

    it("selects inclusive range and dedupes", () => {
        expect(applyRangeSelection([id(2)], ordered, id(2), id(4), "select")).toEqual([
            id(2),
            id(3),
            id(4),
        ]);
    });

    it("deselects inclusive range", () => {
        expect(
            applyRangeSelection([id(1), id(2), id(3), id(4)], ordered, id(2), id(3), "deselect")
        ).toEqual([id(1), id(4)]);
    });

    it("returns current when endpoints missing", () => {
        expect(applyRangeSelection([id(1)], ordered, id(1), id(9), "select")).toEqual([id(1)]);
    });
});

describe("pruneSelectionToVisible", () => {
    it("keeps IDs that remain visible after filter", () => {
        const selected = [id(1), id(2), id(3)];
        expect(pruneSelectionToVisible(selected, [id(2), id(3), id(4)])).toEqual([id(2), id(3)]);
    });

    it("returns the same reference when every selected ID is still visible", () => {
        const selected = [id(1), id(2)];
        expect(pruneSelectionToVisible(selected, [id(1), id(2), id(3)])).toBe(selected);
    });
});
