import { describe, expect, it } from "vitest";
import { LARGE_OPEN_URL_THRESHOLD, shouldWarnBeforeOpenMany } from "./open-many";

describe("shouldWarnBeforeOpenMany", () => {
    it("does not warn below the threshold", () => {
        expect(shouldWarnBeforeOpenMany(0)).toBe(false);
        expect(shouldWarnBeforeOpenMany(LARGE_OPEN_URL_THRESHOLD - 1)).toBe(false);
    });

    it("warns at and above the threshold", () => {
        expect(shouldWarnBeforeOpenMany(LARGE_OPEN_URL_THRESHOLD)).toBe(true);
        expect(shouldWarnBeforeOpenMany(LARGE_OPEN_URL_THRESHOLD + 50)).toBe(true);
    });
});
