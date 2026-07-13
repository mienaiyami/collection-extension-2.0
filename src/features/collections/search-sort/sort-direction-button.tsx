import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SortDir } from "./types";

type SortDirectionButtonProps = {
    sortDir: SortDir;
    disabled: boolean;
    onSortDirChange: (sortDir: SortDir) => void;
};

const SortDirectionButton = ({ sortDir, disabled, onSortDirChange }: SortDirectionButtonProps) => {
    const { t } = useTranslation();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled}
            onClick={() => onSortDirChange(sortDir === "asc" ? "desc" : "asc")}
            aria-label={t("collections.toggleSortDirection")}
        >
            {disabled ? (
                <ArrowUpDown className="size-4" />
            ) : sortDir === "asc" ? (
                <ArrowUp className="size-4" />
            ) : (
                <ArrowDown className="size-4" />
            )}
        </Button>
    );
};

export default SortDirectionButton;
