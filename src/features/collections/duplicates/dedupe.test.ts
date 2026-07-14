import { describe, expect, it } from "vitest";
import {
    countDuplicatesToRemove,
    getDuplicateItemIdsToRemove,
    getOlderDuplicateIdsAfterAdd,
    normalizeItemUrlKey,
} from "./dedupe";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}` as UUID;

const item = (n: number, url: string, createdAt: number): CollectionItem => ({
    id: id(n),
    title: `Item ${n}`,
    url,
    img: "",
    createdAt,
    orderUpdatedAt: createdAt,
});

describe("normalizeItemUrlKey", () => {
    it("trims whitespace", () => {
        expect(normalizeItemUrlKey("  https://a.com  ")).toBe("https://a.com");
    });
});

describe("getDuplicateItemIdsToRemove", () => {
    it("returns empty when urls are unique", () => {
        expect(
            getDuplicateItemIdsToRemove(
                [item(1, "https://a.com", 1), item(2, "https://b.com", 2)],
                "newest"
            )
        ).toEqual([]);
    });

    it("keeps newest by createdAt", () => {
        const items = [
            item(1, "https://a.com", 10),
            item(2, "https://a.com", 30),
            item(3, "https://a.com", 20),
        ];
        expect(getDuplicateItemIdsToRemove(items, "newest").sort()).toEqual([id(1), id(3)].sort());
    });

    it("keeps oldest by createdAt", () => {
        const items = [
            item(1, "https://a.com", 10),
            item(2, "https://a.com", 30),
            item(3, "https://a.com", 20),
        ];
        expect(getDuplicateItemIdsToRemove(items, "oldest").sort()).toEqual([id(2), id(3)].sort());
    });

    it("scopes by url only within the given list", () => {
        const items = [item(1, "https://a.com", 1), item(2, "https://a.com", 2)];
        expect(getDuplicateItemIdsToRemove(items, "newest")).toEqual([id(1)]);
    });

    it("on createdAt tie keeps the first item in array order", () => {
        const items = [
            item(1, "https://a.com", 10),
            item(2, "https://a.com", 10),
            item(3, "https://a.com", 10),
        ];
        expect(getDuplicateItemIdsToRemove(items, "newest").sort()).toEqual([id(2), id(3)].sort());
        expect(getDuplicateItemIdsToRemove(items, "oldest").sort()).toEqual([id(2), id(3)].sort());
    });

    it("ignores empty / whitespace-only urls", () => {
        const items = [item(1, "  ", 1), item(2, "", 2), item(3, "https://a.com", 3)];
        expect(getDuplicateItemIdsToRemove(items, "newest")).toEqual([]);
    });
});

describe("getOlderDuplicateIdsAfterAdd", () => {
    it("removes older rows after a newer duplicate was added", () => {
        const items = [item(9, "https://a.com", 100), item(1, "https://a.com", 10)];
        expect(getOlderDuplicateIdsAfterAdd(items)).toEqual([id(1)]);
    });

    it("keeps a prepended add when createdAt ties with an existing row", () => {
        const items = [item(9, "https://a.com", 50), item(1, "https://a.com", 50)];
        expect(getOlderDuplicateIdsAfterAdd(items)).toEqual([id(1)]);
    });
});

describe("countDuplicatesToRemove", () => {
    it("aggregates across selected collections only", () => {
        const collections: Collection[] = [
            {
                id: id(1),
                title: "A",
                items: [item(1, "https://a.com", 1), item(2, "https://a.com", 2)],
                createdAt: 0,
                updatedAt: 0,
                orderUpdatedAt: 0,
            },
            {
                id: id(2),
                title: "B",
                items: [item(3, "https://b.com", 1)],
                createdAt: 0,
                updatedAt: 0,
                orderUpdatedAt: 0,
            },
        ];
        expect(countDuplicatesToRemove(collections, [id(1), id(2)], "newest")).toEqual({
            removeCount: 1,
            affectedCollections: 1,
        });
    });
});
