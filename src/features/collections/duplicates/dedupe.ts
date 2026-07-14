/** Which occurrence to keep when removing same-URL duplicates within one collection. */
export type DedupeKeep = "newest" | "oldest";

/** Trim for comparison; matching is per-collection only (caller scopes items). */
export const normalizeItemUrlKey = (url: string): string => url.trim();

/**
 * IDs to delete so each URL remains once inside `items`.
 * `newest` / `oldest` use {@link CollectionItem.createdAt}.
 * On a timestamp tie, keeps the first occurrence in array order (important after
 * `unshift` adds — the new row stays when auto-deduping).
 */
export const getDuplicateItemIdsToRemove = (items: CollectionItem[], keep: DedupeKeep): UUID[] => {
    const byUrl = new Map<string, CollectionItem[]>();
    for (const item of items) {
        const key = normalizeItemUrlKey(item.url);
        if (!key) continue;
        const group = byUrl.get(key);
        if (group) group.push(item);
        else byUrl.set(key, [item]);
    }

    const removeIds: UUID[] = [];
    for (const group of byUrl.values()) {
        if (group.length < 2) continue;
        let keepItem = group[0];
        for (let i = 1; i < group.length; i++) {
            const item = group[i];
            if (keep === "oldest") {
                if (item.createdAt < keepItem.createdAt) keepItem = item;
            } else if (item.createdAt > keepItem.createdAt) {
                keepItem = item;
            }
        }
        for (const item of group) {
            if (item.id !== keepItem.id) removeIds.push(item.id);
        }
    }
    return removeIds;
};

/**
 * After new items were prepended, drop older same-URL rows (keep newest by `createdAt`).
 * Used when `autoRemoveDuplicateUrls` is on.
 *
 * @returns removed item ids
 */
export const getOlderDuplicateIdsAfterAdd = (items: CollectionItem[]): UUID[] =>
    getDuplicateItemIdsToRemove(items, "newest");

/** How many items would be removed for the given collections and keep strategy. */
export const countDuplicatesToRemove = (
    collections: Collection[],
    collectionIds: UUID[],
    keep: DedupeKeep
): { removeCount: number; affectedCollections: number } => {
    const idSet = new Set(collectionIds);
    let removeCount = 0;
    let affectedCollections = 0;
    for (const collection of collections) {
        if (!idSet.has(collection.id)) continue;
        const ids = getDuplicateItemIdsToRemove(collection.items, keep);
        if (ids.length === 0) continue;
        removeCount += ids.length;
        affectedCollections += 1;
    }
    return { removeCount, affectedCollections };
};
