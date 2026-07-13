import { describe, expect, it } from "vitest";
import {
    type CollectionOrderItem,
    canDragList,
    filterAndSortCollections,
    filterAndSortItems,
    getCollectionModifiedAt,
    matchCollectionSearch,
    normalizeSearchText,
    toCollectionOrderItem,
} from "./logic";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}` as UUID;

const makeItem = (n: number, overrides: Partial<CollectionItem> = {}): CollectionItem => ({
    id: id(n),
    title: overrides.title ?? `Item ${n}`,
    url: overrides.url ?? `https://example.com/${n}`,
    img: overrides.img ?? "",
    createdAt: overrides.createdAt ?? n * 1000,
    orderUpdatedAt: overrides.orderUpdatedAt ?? n * 1000,
});

const makeCollection = (
    n: number,
    items: CollectionItem[] = [],
    overrides: Partial<Collection> = {}
): Collection => ({
    id: id(n),
    title: overrides.title ?? `Collection ${n}`,
    items,
    createdAt: overrides.createdAt ?? n * 10_000,
    updatedAt: overrides.updatedAt ?? n * 10_000,
    orderUpdatedAt: overrides.orderUpdatedAt ?? n * 10_000,
});

describe("normalizeSearchText / canDragList", () => {
    it("trims and lowercases search text", () => {
        expect(normalizeSearchText("  Foo BAR  ")).toBe("foo bar");
    });

    it("allows drag only when search empty and sort is default", () => {
        expect(canDragList("", "default")).toBe(true);
        expect(canDragList("x", "default")).toBe(false);
        expect(canDragList("", "name")).toBe(false);
        expect(canDragList("x", "name")).toBe(false);
    });
});

describe("getCollectionModifiedAt / toCollectionOrderItem", () => {
    it("uses max of collection and item timestamps", () => {
        const collection = makeCollection(1, [makeItem(2, { orderUpdatedAt: 99_000 })], {
            updatedAt: 5_000,
            orderUpdatedAt: 6_000,
        });
        expect(getCollectionModifiedAt(collection)).toBe(99_000);
        const orderItem = toCollectionOrderItem(collection);
        expect(orderItem.itemLen).toBe(1);
        expect(orderItem.modifiedAt).toBe(99_000);
    });
});

describe("matchCollectionSearch", () => {
    const item = makeItem(1, { title: "Docs", url: "https://docs.example.com" });
    const collection = makeCollection(5, [item], { title: "Work" });
    const orderItem = toCollectionOrderItem(collection);

    it("matches title mode on collection title only", () => {
        expect(matchCollectionSearch(orderItem, collection, "work", "title")).toEqual({
            matches: true,
            matchedViaItems: false,
        });
        expect(matchCollectionSearch(orderItem, collection, "docs", "title")).toEqual({
            matches: false,
            matchedViaItems: false,
        });
    });

    it("matches deep mode via nested item and flags matchedViaItems", () => {
        expect(matchCollectionSearch(orderItem, collection, "docs", "deep")).toEqual({
            matches: true,
            matchedViaItems: true,
        });
        expect(matchCollectionSearch(orderItem, collection, "example.com", "deep")).toEqual({
            matches: true,
            matchedViaItems: true,
        });
    });

    it("does not flag matchedViaItems when title also matches", () => {
        const named = makeCollection(6, [item], { title: "Docs Archive" });
        expect(matchCollectionSearch(toCollectionOrderItem(named), named, "docs", "deep")).toEqual({
            matches: true,
            matchedViaItems: false,
        });
    });
});

describe("filterAndSortCollections", () => {
    const a = makeCollection(1, [makeItem(1, { title: "Alpha link" })], {
        title: "Zebra",
        createdAt: 300,
    });
    const b = makeCollection(2, [], { title: "Alpha", createdAt: 100, updatedAt: 500 });
    const c = makeCollection(3, [makeItem(3), makeItem(4)], {
        title: "Middle",
        createdAt: 200,
    });
    const map = new Map<UUID, Collection>([
        [a.id, a],
        [b.id, b],
        [c.id, c],
    ]);
    const order: CollectionOrderItem[] = [a, b, c].map(toCollectionOrderItem);

    it("returns all when search is empty and sort is default", () => {
        const result = filterAndSortCollections(order, map, "", "title", "default", "asc");
        expect(result.map((x) => x.id)).toEqual([a.id, b.id, c.id]);
    });

    it("filters by title mode", () => {
        const result = filterAndSortCollections(order, map, "alp", "title", "default", "asc");
        expect(result.map((x) => x.id)).toEqual([b.id]);
    });

    it("filters by deep mode and sets matchedViaItems", () => {
        const result = filterAndSortCollections(order, map, "alpha link", "deep", "default", "asc");
        expect(result.map((x) => x.id)).toEqual([a.id]);
        expect(result[0]?.matchedViaItems).toBe(true);
    });

    it("sorts by name asc and desc", () => {
        const asc = filterAndSortCollections(order, map, "", "title", "name", "asc");
        expect(asc.map((x) => x.title)).toEqual(["Alpha", "Middle", "Zebra"]);
        const desc = filterAndSortCollections(order, map, "", "title", "name", "desc");
        expect(desc.map((x) => x.title)).toEqual(["Zebra", "Middle", "Alpha"]);
    });

    it("sorts by itemCount", () => {
        const result = filterAndSortCollections(order, map, "", "title", "itemCount", "asc");
        expect(result.map((x) => x.itemLen)).toEqual([0, 1, 2]);
    });

    it("sorts by date (createdAt)", () => {
        const result = filterAndSortCollections(order, map, "", "title", "date", "asc");
        expect(result.map((x) => x.id)).toEqual([b.id, c.id, a.id]);
    });
});

describe("filterAndSortItems", () => {
    const items = [
        makeItem(1, {
            title: "Charlie",
            url: "https://c.example",
            createdAt: 3,
            orderUpdatedAt: 1,
        }),
        makeItem(2, { title: "Alpha", url: "https://a.example", createdAt: 1, orderUpdatedAt: 3 }),
        makeItem(3, { title: "Bravo", url: "https://b.example", createdAt: 2, orderUpdatedAt: 2 }),
    ];
    const map = new Map(items.map((item) => [item.id, item]));
    const order = items.map((item) => item.id);

    it("filters by title or url", () => {
        expect(filterAndSortItems(order, map, "bravo", "default", "asc")).toEqual([items[2].id]);
        expect(filterAndSortItems(order, map, "a.example", "default", "asc")).toEqual([
            items[1].id,
        ]);
    });

    it("sorts by name and modified", () => {
        expect(filterAndSortItems(order, map, "", "name", "asc")).toEqual([
            items[1].id,
            items[2].id,
            items[0].id,
        ]);
        expect(filterAndSortItems(order, map, "", "modified", "asc")).toEqual([
            items[0].id,
            items[2].id,
            items[1].id,
        ]);
        expect(filterAndSortItems(order, map, "", "date", "desc")).toEqual([
            items[0].id,
            items[2].id,
            items[1].id,
        ]);
    });

    it("skips missing map entries", () => {
        expect(filterAndSortItems([id(9), items[1].id], map, "", "default", "asc")).toEqual([
            items[1].id,
        ]);
    });
});
