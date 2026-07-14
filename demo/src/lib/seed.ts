/**
 * Stable fixture data for changelog demos.
 * UUIDs are fixed so scripts can target rows via `data-collection-id`.
 */

/** Fixed collection ids used by demo scripts. */
export const SEED_IDS = {
    alphaDocs: "a1111111-1111-4111-8111-111111111111",
    betaTools: "b2222222-2222-4222-8222-222222222222",
    zetaResearch: "c3333333-3333-4333-8333-333333333333",
    deltaNews: "d4444444-4444-4444-8444-444444444444",
    gammaDesign: "e5555555-5555-4555-8555-555555555555",
    omegaArchive: "f6666666-6666-4666-8666-666666666666",
    shopping: "a7777777-7777-4777-8777-777777777777",
    learning: "b8888888-8888-4888-8888-888888888888",
    /** ≥20 links — triggers the open-many warning when selected alone. */
    bulkLinks: "c9999999-9999-4999-8999-999999999999",
} as const;

/** Deep-search token that only exists inside an item URL (not a collection title). */
export const DEEP_SEARCH_TOKEN = "orchid-lantern";

type SeedItem = {
    id: string;
    title: string;
    url: string;
    img: string;
    createdAt: number;
    orderUpdatedAt: number;
};

type SeedCollection = {
    id: string;
    title: string;
    items: SeedItem[];
    createdAt: number;
    updatedAt: number;
    orderUpdatedAt: number;
};

type SeedAppSetting = {
    version: number;
    font: { size: number; family: string };
    copyDataFormat: string;
    autoRemoveDuplicateUrls: boolean;
    collectionListView: {
        searchMode: "title" | "deep";
        sortBy: "default" | "name" | "itemCount" | "modified" | "date";
        sortDir: "asc" | "desc";
        filtersOpen: boolean;
    };
    collectionItemView: {
        sortBy: "default" | "name" | "modified" | "date";
        sortDir: "asc" | "desc";
        filtersOpen: boolean;
    };
};

/** Payload written to `chrome.storage.local` before opening the UI. */
export type SeedStorage = {
    collectionData: SeedCollection[];
    deletedCollectionData: [];
    appSetting: SeedAppSetting;
    recentlyUsedCollections: string[];
};

const day = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 5, 1, 12, 0, 0);

/**
 * Builds a fixed UUID from a numeric suffix (must stay unique across the seed).
 */
const uid = (n: number): string => {
    const hex = n.toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${hex}`;
};

const item = (
    idNum: number,
    title: string,
    url: string,
    createdOffsetDays: number,
    orderOffsetDays = createdOffsetDays
): SeedItem => ({
    id: uid(idNum),
    title,
    url,
    img: "",
    createdAt: now - createdOffsetDays * day,
    orderUpdatedAt: now - orderOffsetDays * day,
});

const collection = (
    id: string,
    title: string,
    createdOffsetDays: number,
    updatedOffsetDays: number,
    orderOffsetDays: number,
    items: SeedItem[]
): SeedCollection => ({
    id,
    title,
    items,
    createdAt: now - createdOffsetDays * day,
    updatedAt: now - updatedOffsetDays * day,
    orderUpdatedAt: now - orderOffsetDays * day,
});

/**
 * Builds a fuller seed set for search, sort, deep-match, duplicates, and open-many demos.
 */
export const buildSeedStorage = (): SeedStorage => {
    const alphaDocs = collection(SEED_IDS.alphaDocs, "Alpha Docs", 40, 2, 1, [
        item(101, "Getting Started", "https://example.com/docs/start", 35),
        item(102, "API Reference", "https://example.com/docs/api", 28),
        item(103, "Authentication", "https://example.com/docs/auth", 20),
        item(104, "Webhooks Guide", "https://example.com/docs/webhooks", 12),
        item(105, "Changelog", "https://example.com/docs/changelog", 3),
    ]);

    const betaTools = collection(SEED_IDS.betaTools, "Beta Tools", 35, 5, 5, [
        item(201, "JSON Formatter", "https://example.com/tools/json", 30),
        item(202, "Color Picker", "https://example.com/tools/color", 22),
        item(203, "Regex Tester", "https://example.com/tools/regex", 14),
        item(204, "UUID Generator", "https://example.com/tools/uuid", 8),
        item(205, "Base64 Encode", "https://example.com/tools/base64", 4),
        item(206, "Diff Viewer", "https://example.com/tools/diff", 1),
    ]);

    const zetaResearch = collection(SEED_IDS.zetaResearch, "Zeta Research", 25, 1, 0.5, [
        item(301, "Paper A (older)", "https://example.com/research/paper-a", 18, 18),
        item(302, "Paper A (newer)", "https://example.com/research/paper-a", 3, 3),
        item(303, "Paper A (middle)", "https://example.com/research/paper-a", 10, 10),
        item(304, "Survey Notes", "https://example.com/research/survey-notes", 7),
        item(
            305,
            "Hidden Deep Match",
            `https://example.com/research/${DEEP_SEARCH_TOKEN}-unique`,
            2
        ),
        item(306, "Citation List", "https://example.com/research/citations", 5),
        item(307, "Methodology Draft", "https://example.com/research/methodology", 1),
    ]);

    const deltaNews = collection(SEED_IDS.deltaNews, "Delta News", 20, 0.2, 0.2, [
        item(401, "Morning Brief", "https://news.example.com/morning", 6),
        item(402, "Tech Roundup", "https://news.example.com/tech", 4),
        item(403, "Open Source Weekly", "https://news.example.com/oss", 2),
        item(404, "Browser Tips", "https://news.example.com/browsers", 1),
    ]);

    const gammaDesign = collection(SEED_IDS.gammaDesign, "Gamma Design", 28, 4, 4, [
        item(501, "Type Scale", "https://design.example.com/type", 24),
        item(502, "Color Tokens", "https://design.example.com/colors", 16),
        item(503, "Spacing System", "https://design.example.com/spacing", 9),
        item(504, "Icon Set", "https://design.example.com/icons", 5),
        item(505, "Motion Spec", "https://design.example.com/motion", 2),
    ]);

    const omegaArchive = collection(SEED_IDS.omegaArchive, "Omega Archive", 60, 15, 12, [
        item(601, "Old Bookmark 1", "https://archive.example.com/1", 55),
        item(602, "Old Bookmark 2", "https://archive.example.com/2", 50),
        item(603, "Old Bookmark 3", "https://archive.example.com/3", 45),
        item(604, "Duplicate Archive", "https://archive.example.com/keep", 40, 40),
        item(605, "Duplicate Archive Copy", "https://archive.example.com/keep", 20, 20),
        item(606, "Legacy Notes", "https://archive.example.com/notes", 30),
        item(607, "2023 Dump", "https://archive.example.com/2023", 35),
        item(608, "2024 Dump", "https://archive.example.com/2024", 18),
    ]);

    const shopping = collection(SEED_IDS.shopping, "Shopping List", 15, 3, 3, [
        item(701, "Mechanical Keyboard", "https://shop.example.com/keyboard", 12),
        item(702, "USB-C Hub", "https://shop.example.com/hub", 9),
        item(703, "Monitor Light", "https://shop.example.com/light", 6),
        item(704, "Desk Mat", "https://shop.example.com/mat", 2),
    ]);

    const learning = collection(SEED_IDS.learning, "Learning Paths", 18, 1.5, 1.5, [
        item(801, "TypeScript Handbook", "https://learn.example.com/ts", 14),
        item(802, "React Patterns", "https://learn.example.com/react", 10),
        item(803, "CSS Layout", "https://learn.example.com/css", 7),
        item(804, "Browser Extensions", "https://learn.example.com/extensions", 3),
        item(805, "Playwright Guide", "https://learn.example.com/playwright", 1),
        item(806, "Accessibility Basics", "https://learn.example.com/a11y", 5),
    ]);

    const bulkItems = Array.from({ length: 22 }, (_, i) =>
        item(900 + i, `Bulk Tab ${i + 1}`, `https://bulk.example.com/page-${i + 1}`, 22 - i)
    );
    const bulkLinks = collection(SEED_IDS.bulkLinks, "Bulk Links", 8, 0.1, 0.1, bulkItems);

    const collectionData = [
        alphaDocs,
        betaTools,
        zetaResearch,
        deltaNews,
        gammaDesign,
        omegaArchive,
        shopping,
        learning,
        bulkLinks,
    ];

    return {
        collectionData,
        deletedCollectionData: [],
        recentlyUsedCollections: [
            SEED_IDS.zetaResearch,
            SEED_IDS.deltaNews,
            SEED_IDS.alphaDocs,
            SEED_IDS.learning,
        ],
        appSetting: {
            version: 1,
            font: { size: 16, family: "Inter" },
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
        },
    };
};
