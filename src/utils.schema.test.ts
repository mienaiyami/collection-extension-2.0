import { describe, expect, it, vi } from "vitest";
import { appSettingSchema, collectionItemSchema, collectionSchema } from "./utils";

vi.mock("webextension-polyfill", () => ({
    default: {},
}));

describe("appSettingSchema", () => {
    it("applies defaults for an empty object", () => {
        expect(appSettingSchema.parse({})).toEqual({
            version: 1,
            font: {
                size: 16,
                family: "Inter",
            },
            copyDataFormat: "{{url}}",
            autoRemoveDuplicateUrls: false,
            collectionListView: {
                searchMode: "title",
                sortBy: "default",
                sortDir: "asc",
                filtersOpen: false,
            },
            collectionItemView: {
                sortBy: "default",
                sortDir: "asc",
                filtersOpen: false,
            },
        });
    });

    it("fills collection view defaults when older settings omit them", () => {
        expect(
            appSettingSchema.parse({
                version: 1,
                font: { size: 16, family: "Inter" },
                copyDataFormat: "{{url}}",
            })
        ).toMatchObject({
            version: 1,
            collectionListView: {
                searchMode: "title",
                sortBy: "default",
                filtersOpen: false,
            },
            collectionItemView: {
                sortBy: "default",
                filtersOpen: false,
            },
        });
    });
});

describe("collectionItemSchema", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";

    it("maps legacy date string into createdAt and orderUpdatedAt", () => {
        const date = "2024-01-15T12:00:00.000Z";
        const result = collectionItemSchema.parse({
            title: "Example",
            url: "https://example.com",
            img: "",
            id,
            date,
        });

        expect(result).toEqual({
            title: "Example",
            url: "https://example.com",
            img: "",
            id,
            createdAt: new Date(date).getTime(),
            orderUpdatedAt: new Date(date).getTime(),
        });
    });

    it("keeps explicit createdAt and orderUpdatedAt", () => {
        const result = collectionItemSchema.parse({
            title: "Example",
            url: "https://example.com",
            img: "",
            id,
            createdAt: 100,
            orderUpdatedAt: 200,
        });

        expect(result.createdAt).toBe(100);
        expect(result.orderUpdatedAt).toBe(200);
    });
});

describe("collectionSchema", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const itemId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

    it("parses a collection and its items", () => {
        const date = "2024-06-01T00:00:00.000Z";
        const result = collectionSchema.parse({
            id,
            title: "Reading",
            date,
            items: [
                {
                    title: "Example",
                    url: "https://example.com",
                    img: "",
                    id: itemId,
                    date,
                },
            ],
        });

        expect(result.id).toBe(id);
        expect(result.title).toBe("Reading");
        expect(result.createdAt).toBe(new Date(date).getTime());
        expect(result.items).toHaveLength(1);
        expect(result.items[0]?.id).toBe(itemId);
    });
});
