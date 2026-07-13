import type { collectionItemViewSettingSchema, collectionListViewSettingSchema } from "@/utils";
import type { z } from "zod";

type CollectionListViewSetting = z.infer<typeof collectionListViewSettingSchema>;
type CollectionItemViewSetting = z.infer<typeof collectionItemViewSettingSchema>;

/** Label/value pair for search-mode or sort toggle rows. */
export type SearchSortOption<T extends string> = {
    value: T;
    label: string;
};

export type CollectionSearchMode = CollectionListViewSetting["searchMode"];
export type CollectionSearchSortBy = CollectionListViewSetting["sortBy"];
export type ItemSearchSortBy = CollectionItemViewSetting["sortBy"];
export type SortDir = CollectionListViewSetting["sortDir"];

export type ActiveItemSearchSortBy = Exclude<ItemSearchSortBy, "default">;
export type ActiveCollectionSearchSortBy = Exclude<CollectionSearchSortBy, "default">;
