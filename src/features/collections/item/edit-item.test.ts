import { describe, expect, it } from "vitest";
import { MAX_ITEM_IMAGE_DATA_URL_LENGTH, isValidItemImageSrc, parseItemUrl } from "./edit-item";

describe("parseItemUrl", () => {
    it("normalizes a valid absolute URL", () => {
        expect(parseItemUrl("  https://example.com/path  ")).toBe("https://example.com/path");
    });

    it("returns null for empty or invalid input", () => {
        expect(parseItemUrl("")).toBeNull();
        expect(parseItemUrl("not-a-url")).toBeNull();
    });
});

describe("isValidItemImageSrc", () => {
    it("allows empty, http(s), favicon schemes, and small data URLs", () => {
        expect(isValidItemImageSrc("")).toBe(true);
        expect(isValidItemImageSrc("https://cdn.example.com/a.png")).toBe(true);
        expect(isValidItemImageSrc("chrome-extension://abc/icon.png")).toBe(true);
        expect(isValidItemImageSrc("data:image/png;base64,abc")).toBe(true);
    });

    it("rejects oversized data URLs and javascript: URLs", () => {
        expect(
            isValidItemImageSrc(
                `data:image/png;base64,${"a".repeat(MAX_ITEM_IMAGE_DATA_URL_LENGTH)}`
            )
        ).toBe(false);
        expect(isValidItemImageSrc("javascript:alert(1)")).toBe(false);
        expect(isValidItemImageSrc("not-a-url")).toBe(false);
    });
});
