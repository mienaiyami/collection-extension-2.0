/**
 * Shift+click range select/deselect over the **visible** ordered ID list.
 * Uses the last changed row as the range anchor (Collection View and Collection Item View).
 */
export const applyRangeSelection = (
    current: UUID[],
    orderedIds: UUID[],
    fromId: UUID,
    toId: UUID,
    mode: "select" | "deselect"
): UUID[] => {
    const fromIndex = orderedIds.findIndex((id) => id === fromId);
    const toIndex = orderedIds.findIndex((id) => id === toId);
    if (fromIndex === -1 || toIndex === -1) return [...current];

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const range = orderedIds.slice(start, end + 1);

    if (mode === "select") {
        return [...new Set([...current, ...range])];
    }

    const rangeSet = new Set(range);
    return current.filter((id) => !rangeSet.has(id));
};

/**
 * Keep only IDs that are still in the visible (filtered/sorted) list.
 * Returns the same array reference when nothing was removed.
 */
export const pruneSelectionToVisible = (selected: UUID[], visibleIds: UUID[]): UUID[] => {
    const visibleIdSet = new Set(visibleIds);
    const next = selected.filter((id) => visibleIdSet.has(id));
    if (next.length === selected.length) return selected;
    return next;
};
