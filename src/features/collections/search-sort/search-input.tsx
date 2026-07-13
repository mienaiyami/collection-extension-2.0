import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type SearchInputProps = {
    search: string;
    onSearchChange: (search: string) => void;
    placeholder: string;
    filtersOpen: boolean;
    isFilterActive: boolean;
    onToggleFilters: () => void;
};

const SearchInput = ({
    search,
    onSearchChange,
    placeholder,
    filtersOpen,
    isFilterActive,
    onToggleFilters,
}: SearchInputProps) => {
    const { t } = useTranslation();

    return (
        <div className="border-border border-b p-2">
            <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                    placeholder={placeholder}
                    className="rounded-md border-transparent bg-transparent pr-16 pl-9 focus-visible:border-input"
                />
                <div className="absolute right-1 flex items-center gap-0.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`relative size-8 ${filtersOpen || isFilterActive ? "bg-muted" : ""}`}
                        onClick={onToggleFilters}
                        aria-label={t("collections.toggleFilters")}
                    >
                        <SlidersHorizontal className="size-4" />
                        {isFilterActive && (
                            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
                        )}
                    </Button>
                    {search && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => onSearchChange("")}
                            aria-label={t("collections.clearSearch")}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchInput;
