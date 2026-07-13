import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { canDragList, filterAndSortItems, normalizeSearchText } from "./logic";
import type { ItemSearchSortBy, SearchSortOption, SortDir } from "./types";

/**
 * Collection Item View search/sort.
 * Sort, direction, and filters-open come from {@link AppSettingType.collectionItemView}.
 * Search text stays local to the mounted view.
 */
export const useCollectionItemSearchSort = (
    itemsOrder: UUID[],
    itemsMap: Map<UUID, CollectionItem> | undefined
) => {
    const { t } = useTranslation();
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    const itemView = appSetting.collectionItemView;

    const [search, setSearch] = useState("");

    const patchItemView = (patch: Partial<AppSettingType["collectionItemView"]>) => {
        operations.setAppSetting({
            collectionItemView: { ...itemView, ...patch },
        });
    };

    const searchText = normalizeSearchText(search);
    const canDrag = canDragList(searchText, itemView.sortBy);

    const itemSortOptions: SearchSortOption<ItemSearchSortBy>[] = [
        { value: "default", label: t("collections.sortDefault") },
        { value: "name", label: t("collections.sortName") },
        { value: "modified", label: t("collections.sortModified") },
        { value: "date", label: t("collections.sortDate") },
    ];

    const visibleItemsOrder = useMemo(
        () =>
            filterAndSortItems(itemsOrder, itemsMap, searchText, itemView.sortBy, itemView.sortDir),
        [itemsMap, itemsOrder, itemView.sortBy, itemView.sortDir, searchText]
    );

    return {
        canDrag,
        controlsProps: {
            search,
            onSearchChange: setSearch,
            placeholder: t("collections.searchItemsPlaceholder"),
            sortBy: itemView.sortBy,
            onSortByChange: (sortBy: ItemSearchSortBy) => patchItemView({ sortBy }),
            sortOptions: itemSortOptions,
            sortDir: itemView.sortDir,
            onSortDirChange: (sortDir: SortDir) => patchItemView({ sortDir }),
            defaultSortBy: "default" as const,
            filtersOpen: itemView.filtersOpen,
            onFiltersOpenChange: (filtersOpen: boolean) => patchItemView({ filtersOpen }),
        },
        search,
        searchText,
        visibleItemsOrder,
    };
};
