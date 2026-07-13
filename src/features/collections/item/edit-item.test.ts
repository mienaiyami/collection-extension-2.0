import { describe, expect, it } from "vitest";
import {
    MAX_ITEM_IMAGE_DATA_URL_LENGTH,
    getImageFileFromDataTransfer,
    getSafeItemImageSrc,
    isValidItemImageSrc,
    parseItemUrl,
} from "./edit-item";

describe("parseItemUrl", () => {
    it("normalizes http(s) URLs", () => {
        expect(parseItemUrl("  https://example.com/path  ")).toBe("https://example.com/path");
        expect(parseItemUrl("http://example.com")).toBe("http://example.com/");
    });

    it("rejects empty, invalid, and non-http(s) schemes", () => {
        expect(parseItemUrl("")).toBeNull();
        expect(parseItemUrl("not-a-url")).toBeNull();
        expect(parseItemUrl("javascript:alert(1)")).toBeNull();
        expect(parseItemUrl("ftp://example.com")).toBeNull();
    });
});

describe("getSafeItemImageSrc / isValidItemImageSrc", () => {
    it("allows empty save, http(s), extension schemes, and small data URLs", () => {
        expect(isValidItemImageSrc("")).toBe(true);
        expect(getSafeItemImageSrc("")).toBeNull();
        expect(getSafeItemImageSrc("https://cdn.example.com/a.png")).toBe(
            "https://cdn.example.com/a.png"
        );
        expect(getSafeItemImageSrc("chrome-extension://abc/icon.png")).toBe(
            "chrome-extension://abc/icon.png"
        );
        expect(getSafeItemImageSrc("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    });

    it("rejects executable or oversized image sources", () => {
        expect(
            getSafeItemImageSrc(
                `data:image/png;base64,${"a".repeat(MAX_ITEM_IMAGE_DATA_URL_LENGTH)}`
            )
        ).toBeNull();
        expect(getSafeItemImageSrc("data:text/html,<script>")).toBeNull();
        expect(getSafeItemImageSrc("javascript:alert(1)")).toBeNull();
        expect(getSafeItemImageSrc("vbscript:msgbox(1)")).toBeNull();
        expect(getSafeItemImageSrc("not-a-url")).toBeNull();
        expect(isValidItemImageSrc("javascript:alert(1)")).toBe(false);
    });
});

describe("getImageFileFromDataTransfer", () => {
    it("returns null when there is no image", () => {
        expect(getImageFileFromDataTransfer(null)).toBeNull();
        const data = {
            items: [] as DataTransferItem[],
            files: [] as unknown as FileList,
        } as unknown as DataTransfer;
        expect(getImageFileFromDataTransfer(data)).toBeNull();
    });

    it("returns the first image file from items", () => {
        const file = new File([new Uint8Array([1, 2, 3])], "clip.png", { type: "image/png" });
        const data = {
            items: [
                {
                    kind: "file",
                    type: "image/png",
                    getAsFile: () => file,
                },
            ],
            files: [] as unknown as FileList,
        } as unknown as DataTransfer;
        expect(getImageFileFromDataTransfer(data)).toBe(file);
    });
});
