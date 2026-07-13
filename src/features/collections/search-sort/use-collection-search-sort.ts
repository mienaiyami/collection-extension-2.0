import { useAppContext } from "@/features/layout/App";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type CollectionOrderItem,
    canDragList,
    filterAndSortCollections,
    normalizeSearchText,
    toCollectionOrderItem,
} from "./logic";
import type {
    CollectionSearchMode,
    CollectionSearchSortBy,
    SearchSortOption,
    SortDir,
} from "./types";

export type { CollectionOrderItem, CollectionSearchMode };

/**
 * Collection View search/sort.
 * Mode, sort, direction, and filters-open come from {@link AppSettingType.collectionListView}.
 * Search text lives on App context (same idea as scrollPos) so it survives open/close.
 */
export const useCollectionSearchSort = (collectionData: Collection[]) => {
    const { t } = useTranslation();
    const { collectionListSearch, setCollectionListSearch } = useAppContext();
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    const listView = appSetting.collectionListView;

    const [collectionOrder, setCollectionOrder] = useState<CollectionOrderItem[]>([]);

    const patchListView = (patch: Partial<AppSettingType["collectionListView"]>) => {
        operations.setAppSetting({
            collectionListView: { ...listView, ...patch },
        });
    };

    /* O(1) lookups while filtering deep matches against nested items. */
    const collectionMap = useMemo(
        () => new Map(collectionData.map((collection) => [collection.id, collection])),
        [collectionData]
    );

    useLayoutEffect(() => {
        setCollectionOrder(collectionData.map(toCollectionOrderItem));
    }, [collectionData]);

    const searchText = normalizeSearchText(collectionListSearch);
    const canDrag = canDragList(searchText, listView.sortBy);

    const collectionSearchModeOptions: SearchSortOption<CollectionSearchMode>[] = [
        { value: "title", label: t("collections.searchModeTitle") },
        { value: "deep", label: t("collections.searchModeDeep") },
    ];

    const collectionSortOptions: SearchSortOption<CollectionSearchSortBy>[] = [
        { value: "default", label: t("collections.sortDefault") },
        { value: "name", label: t("collections.sortName") },
        { value: "itemCount", label: t("collections.sortItemCount") },
        { value: "modified", label: t("collections.sortModified") },
        { value: "date", label: t("collections.sortDate") },
    ];

    /* Filter/sort can be O(n log n) over large lists — memoize for typing in the search box. */
    const visibleCollections = useMemo(
        () =>
            filterAndSortCollections(
                collectionOrder,
                collectionMap,
                searchText,
                listView.searchMode,
                listView.sortBy,
                listView.sortDir
            ),
        [
            collectionMap,
            collectionOrder,
            listView.searchMode,
            listView.sortBy,
            listView.sortDir,
            searchText,
        ]
    );

    return {
        canDrag,
        collectionOrder,
        controlsProps: {
            search: collectionListSearch,
            onSearchChange: setCollectionListSearch,
            placeholder: t("collections.searchCollectionsPlaceholder"),
            searchMode: listView.searchMode,
            onSearchModeChange: (searchMode: CollectionSearchMode) => patchListView({ searchMode }),
            searchModeOptions: collectionSearchModeOptions,
            defaultSearchMode: "title" as const,
            sortBy: listView.sortBy,
            onSortByChange: (sortBy: CollectionSearchSortBy) => patchListView({ sortBy }),
            sortOptions: collectionSortOptions,
            sortDir: listView.sortDir,
            onSortDirChange: (sortDir: SortDir) => patchListView({ sortDir }),
            defaultSortBy: "default" as const,
            filtersOpen: listView.filtersOpen,
            onFiltersOpenChange: (filtersOpen: boolean) => patchListView({ filtersOpen }),
        },
        search: collectionListSearch,
        searchText,
        setCollectionOrder,
        visibleCollections,
    };
};
