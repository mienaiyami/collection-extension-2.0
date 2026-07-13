import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ReactNode } from "react";
import type { SearchSortOption } from "./types";

type OptionToggleRowProps<T extends string> = {
    label: string;
    value: T;
    options: SearchSortOption<T>[];
    onValueChange: (value: T) => void;
    childrenAfter?: ReactNode;
    childrenBefore?: ReactNode;
};

const OptionToggleRow = <T extends string>({
    label,
    value,
    options,
    onValueChange,
    childrenAfter,
    childrenBefore,
}: OptionToggleRowProps<T>) => (
    <div className="flex items-start justify-between gap-2 px-2 py-1.5">
        <span className="pt-1.5 text-muted-foreground text-xs capitalize">{label}</span>
        <div className="flex flex-wrap items-center justify-end gap-1">
            {childrenBefore}
            <ToggleGroup
                type="single"
                size="sm"
                variant="outline"
                value={value}
                onValueChange={(nextValue) => {
                    if (nextValue) onValueChange(nextValue as T);
                }}
                className="flex-wrap justify-end gap-0"
            >
                {options.map((option) => (
                    <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="rounded-none border-l-0 px-2 text-xs shadow-none first:rounded-l-md first:border-l last:rounded-r-md data-[state=on]:z-10"
                    >
                        {option.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            {childrenAfter}
        </div>
    </div>
);

export default OptionToggleRow;
