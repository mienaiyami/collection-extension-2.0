import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import OptionToggleRow from "./option-toggle-row";
import SearchInput from "./search-input";
import SortDirectionButton from "./sort-direction-button";
import type { SearchSortOption, SortDir } from "./types";

export type SearchSortControlsProps<SearchMode extends string, SortBy extends string> = {
    search: string;
    onSearchChange: (search: string) => void;
    placeholder: string;
    searchMode?: SearchMode;
    onSearchModeChange?: (mode: SearchMode) => void;
    searchModeOptions?: SearchSortOption<SearchMode>[];
    defaultSearchMode?: SearchMode;
    sortBy: SortBy;
    onSortByChange: (sortBy: SortBy) => void;
    sortOptions: SearchSortOption<SortBy>[];
    sortDir: SortDir;
    onSortDirChange: (sortDir: SortDir) => void;
    defaultSortBy: SortBy;
    filtersOpen: boolean;
    onFiltersOpenChange: (open: boolean) => void;
};

/**
 * Search input + collapsible filter panel (mode/sort) for collection and item lists.
 * Filter badge lights when sort or search mode differs from the defaults.
 * {@link filtersOpen} is controlled by the parent (usually app settings).
 */
const SearchSortControls = <SearchMode extends string, SortBy extends string>({
    search,
    onSearchChange,
    placeholder,
    searchMode,
    onSearchModeChange,
    searchModeOptions = [],
    defaultSearchMode,
    sortBy,
    onSortByChange,
    sortOptions,
    sortDir,
    onSortDirChange,
    defaultSortBy,
    filtersOpen,
    onFiltersOpenChange,
}: SearchSortControlsProps<SearchMode, SortBy>) => {
    const { t } = useTranslation();

    const hasSearchModes =
        searchModeOptions.length > 0 &&
        searchMode !== undefined &&
        onSearchModeChange !== undefined;

    const isFilterActive =
        sortBy !== defaultSortBy ||
        Boolean(
            hasSearchModes && defaultSearchMode && searchMode && searchMode !== defaultSearchMode
        );

    return (
        <Collapsible open={filtersOpen} onOpenChange={onFiltersOpenChange}>
            <SearchInput
                search={search}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
                filtersOpen={filtersOpen}
                isFilterActive={isFilterActive}
                onToggleFilters={() => onFiltersOpenChange(!filtersOpen)}
            />
            <CollapsibleContent>
                <div className="border-border border-b bg-muted/30">
                    {hasSearchModes && (
                        <OptionToggleRow
                            label={t("collections.searchMode")}
                            value={searchMode}
                            options={searchModeOptions}
                            onValueChange={(value) => onSearchModeChange?.(value)}
                        />
                    )}
                    <OptionToggleRow
                        label={t("collections.sort")}
                        value={sortBy}
                        options={sortOptions}
                        onValueChange={onSortByChange}
                        childrenBefore={
                            <SortDirectionButton
                                sortDir={sortDir}
                                disabled={sortBy === defaultSortBy}
                                onSortDirChange={onSortDirChange}
                            />
                        }
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

export default SearchSortControls;
