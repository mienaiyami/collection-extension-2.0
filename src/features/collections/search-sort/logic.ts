import type {
    ActiveCollectionSearchSortBy,
    ActiveItemSearchSortBy,
    CollectionSearchMode,
    CollectionSearchSortBy,
    ItemSearchSortBy,
    SortDir,
} from "./types";

/**
 * Lightweight row model for Collection View reorder + search/sort.
 * {@link matchedViaItems} is set during filtering when the hit came from nested items only.
 */
export type CollectionOrderItem = {
    id: UUID;
    title: string;
    itemLen: number;
    createdAt: number;
    updatedAt: number;
    orderUpdatedAt: number;
    modifiedAt: number;
    /** True when search matched via nested items only (not collection title). */
    matchedViaItems?: boolean;
};

/**
 * Latest activity timestamp for a collection: max of collection `updatedAt` /
 * `orderUpdatedAt` and every item's `createdAt` / `orderUpdatedAt`.
 */
export const getCollectionModifiedAt = (collection: Collection): number =>
    Math.max(
        collection.updatedAt,
        collection.orderUpdatedAt,
        ...collection.items.map((item) => Math.max(item.createdAt, item.orderUpdatedAt)),
        0
    );

/** Maps a full {@link Collection} into a {@link CollectionOrderItem} for the list UI. */
export const toCollectionOrderItem = (collection: Collection): CollectionOrderItem => ({
    id: collection.id,
    title: collection.title,
    itemLen: collection.items.length,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    orderUpdatedAt: collection.orderUpdatedAt,
    modifiedAt: getCollectionModifiedAt(collection),
});

/**
 * Drag-reorder is only safe in the manual order. Disable while filtering or using a non-default sort
 * so Framer Reorder cannot persist a partial/visible-only order.
 */
export const canDragList = (searchText: string, sortBy: string): boolean =>
    !searchText && sortBy === "default";

/** Trims and lowercases user search input for case-insensitive substring matching. */
export const normalizeSearchText = (search: string): string => search.trim().toLowerCase();

const titleMatches = (title: string, searchText: string): boolean =>
    title.toLowerCase().includes(searchText);

const itemMatchesSearch = (item: CollectionItem, searchText: string): boolean =>
    titleMatches(item.title, searchText) || item.url.toLowerCase().includes(searchText);

export type CollectionMatchResult = {
    matches: boolean;
    matchedViaItems: boolean;
};

/**
 * Decides whether a collection row matches the current query.
 * In `deep` mode, a nested item hit sets {@link CollectionMatchResult.matchedViaItems}
 * so the UI can show a “matched via items” hint without a title hit.
 */
export const matchCollectionSearch = (
    orderItem: CollectionOrderItem,
    fullCollection: Collection | undefined,
    searchText: string,
    searchMode: CollectionSearchMode
): CollectionMatchResult => {
    if (!searchText) return { matches: true, matchedViaItems: false };

    const titleHit = titleMatches(orderItem.title, searchText);
    if (titleHit) return { matches: true, matchedViaItems: false };
    if (searchMode === "title") return { matches: false, matchedViaItems: false };

    const itemsHit = Boolean(
        fullCollection?.items.some((item) => itemMatchesSearch(item, searchText))
    );
    return { matches: itemsHit, matchedViaItems: itemsHit };
};

/** Comparators for active (non-default) collection sorts. */
const collectionSorters: Record<
    ActiveCollectionSearchSortBy,
    (a: CollectionOrderItem, b: CollectionOrderItem) => number
> = {
    name: (a, b) => a.title.localeCompare(b.title),
    itemCount: (a, b) => a.itemLen - b.itemLen,
    modified: (a, b) => a.modifiedAt - b.modifiedAt,
    date: (a, b) => a.createdAt - b.createdAt,
};

const applySortDir = (compare: number, sortDir: SortDir): number =>
    sortDir === "asc" ? compare : -compare;

/**
 * Filters then optionally sorts collection rows for Collection View.
 * Copies before sorting so the underlying drag order ({@link CollectionOrderItem} list) stays intact.
 */
export const filterAndSortCollections = (
    order: CollectionOrderItem[],
    collectionMap: Map<UUID, Collection>,
    searchText: string,
    searchMode: CollectionSearchMode,
    sortBy: CollectionSearchSortBy,
    sortDir: SortDir
): CollectionOrderItem[] => {
    let result: CollectionOrderItem[] = [];

    for (const item of order) {
        const match = matchCollectionSearch(
            item,
            collectionMap.get(item.id),
            searchText,
            searchMode
        );
        if (!match.matches) continue;
        result.push({
            ...item,
            matchedViaItems: match.matchedViaItems,
        });
    }

    if (sortBy !== "default") {
        const sorter = collectionSorters[sortBy];
        result = [...result].sort((a, b) => applySortDir(sorter(a, b), sortDir));
    }

    return result;
};

/** Comparators for active (non-default) item sorts inside a collection. */
const itemSorters: Record<
    ActiveItemSearchSortBy,
    (a: CollectionItem, b: CollectionItem) => number
> = {
    name: (a, b) => a.title.localeCompare(b.title),
    modified: (a, b) => a.orderUpdatedAt - b.orderUpdatedAt,
    date: (a, b) => a.createdAt - b.createdAt,
};

/**
 * Filters then optionally sorts item IDs for Collection Item View.
 * Missing map entries are skipped (stale IDs after deletes).
 */
export const filterAndSortItems = (
    itemsOrder: UUID[],
    itemsMap: Map<UUID, CollectionItem> | undefined,
    searchText: string,
    sortBy: ItemSearchSortBy,
    sortDir: SortDir
): UUID[] => {
    let result = itemsOrder
        .map((id) => itemsMap?.get(id))
        .filter((item): item is CollectionItem => item !== undefined);

    if (searchText) {
        result = result.filter((item) => itemMatchesSearch(item, searchText));
    }

    if (sortBy !== "default") {
        const sorter = itemSorters[sortBy];
        result = [...result].sort((a, b) => applySortDir(sorter(a, b), sortDir));
    }

    return result.map((item) => item.id);
};
