import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRemoveDuplicatesDialog } from "@/features/collections/duplicates/use-remove-duplicates-dialog";
import {
    applyRangeSelection,
    pruneSelectionToVisible,
} from "@/features/collections/selection/range-select";
import { useAppContext } from "@/features/layout/App";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Reorder } from "framer-motion";
import { MoreHorizontal, Trash, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Collection from "../item/Collection";
import SearchSortControls from "../search-sort/search-sort-controls";
import { useCollectionSearchSort } from "../search-sort/use-collection-search-sort";
import { useOpenManyWarning } from "../use-open-many-warning";

const CollectionView = () => {
    const { collectionData, setScrollPos, scrollPos, setOpenColOnCreate } = useAppContext();
    const operations = useCollectionOperations();
    const { appSetting } = useAppSetting();
    const { t } = useTranslation();
    const {
        canDrag,
        collectionOrder,
        controlsProps,
        search,
        searchText,
        setCollectionOrder,
        visibleCollections,
    } = useCollectionSearchSort(collectionData);

    const { requestOpenMany, openManyWarningDialog } = useOpenManyWarning();
    const { openForCollections, removeDuplicatesDialog } = useRemoveDuplicatesDialog();

    const [selected, setSelected] = useState<UUID[]>([]);
    const [lastChanged, setLastChanged] = useState<{
        id: UUID;
        type: "select" | "deselect";
    } | null>(null);
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);

    const selected_deleteRef = useRef<HTMLButtonElement>(null);
    const selected_open = useRef<HTMLButtonElement>(null);
    const selected_openNewWindow = useRef<HTMLButtonElement>(null);
    const selected_openIncognito = useRef<HTMLButtonElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const initialScrollPos = useRef(scrollPos);

    const selectedCollections = collectionData.filter((collection) =>
        selected.includes(collection.id)
    );
    const selectedItemCount = selectedCollections.reduce(
        (sum, collection) => sum + collection.items.length,
        0
    );

    const changeSelected = (id: UUID, checked: boolean) => {
        setLastChanged({
            id,
            type: checked ? "select" : "deselect",
        });
        setSelected((init) => {
            if (!checked) {
                return init.filter((itemId) => itemId !== id);
            }
            return [...new Set([...init, id])];
        });
    };

    const onShiftPlusClick = (onItem: UUID) => {
        if (!lastChanged) return;
        const orderedIds = visibleCollections.map((collection) => collection.id);
        setSelected((init) =>
            applyRangeSelection(init, orderedIds, lastChanged.id, onItem, lastChanged.type)
        );
    };

    const copySelectedCollections = () => {
        const chunks = selectedCollections.map((collection) =>
            window.formatCopyData(appSetting.copyDataFormat, collection.items, collection.title)
        );
        navigator.clipboard.writeText(chunks.filter(Boolean).join("\n\n"));
        toast.success(
            t("messages.copiedItems", {
                count: selectedItemCount,
            })
        );
    };
    const copySelectedCollectionsRef = useRef(copySelectedCollections);
    copySelectedCollectionsRef.current = copySelectedCollections;

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            ref.current?.scrollTo({ top: initialScrollPos.current });
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    /* Drop selection that fell out of the visible (filtered) list. */
    useLayoutEffect(() => {
        const visibleIds = visibleCollections.map((collection) => collection.id);
        setSelected((prev) => pruneSelectionToVisible(prev, visibleIds));
    }, [visibleCollections]);

    useLayoutEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            const isTextInput =
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA" ||
                (document.activeElement as HTMLElement)?.isContentEditable;
            if (isTextInput) return;

            switch (e.code) {
                case "Delete":
                    if (selected.length > 0) selected_deleteRef.current?.click();
                    break;
                case "KeyN":
                    if (selected.length > 0) {
                        if (e.shiftKey) selected_openIncognito.current?.click();
                        else selected_openNewWindow.current?.click();
                    }
                    break;
                case "KeyT":
                    if (selected.length > 0) selected_open.current?.click();
                    break;
                case "KeyC":
                    if (selected.length > 0) copySelectedCollectionsRef.current();
                    break;
                case "Escape":
                    setSelected([]);
                    break;
                case "KeyA":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        setSelected(visibleCollections.map((collection) => collection.id));
                    }
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", keyHandler);
        return () => window.removeEventListener("keydown", keyHandler);
    }, [selected.length, visibleCollections]);

    return (
        <>
            <AlertDialog
                onOpenChange={(open) => {
                    if (!open) setDeleteConfirmed(false);
                }}
            >
                <div className="grid min-h-full grid-rows-[auto_auto_1fr]">
                    <SearchSortControls {...controlsProps} />

                    {selected.length === 0 ? (
                        <div className="grid h-12 grid-cols-[1fr_1px_1fr] items-center border-border border-b p-1">
                            <Button
                                variant={"ghost"}
                                onClick={async () => {
                                    const response = await operations.makeNewCollection(
                                        new Date().toLocaleString()
                                    );
                                    if (response.success) {
                                        setOpenColOnCreate(response.data.collection.id);
                                    }
                                }}
                            >
                                {t("collections.newEmpty")}
                            </Button>
                            <Separator orientation="vertical" />
                            <Button
                                variant={"ghost"}
                                onClick={async () => {
                                    operations.makeNewCollection(new Date().toLocaleString(), [], {
                                        activeWindowId: (await window.browser.windows.getCurrent())
                                            .id,
                                    });
                                }}
                            >
                                {t("collections.newFromOpenedTabs")}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex h-12 w-full flex-row items-center border-border border-b p-1">
                            <span className="p-1">
                                {selected.length} {t("collections.selected")}
                            </span>
                            <Button
                                className="ml-auto p-1"
                                variant={"ghost"}
                                ref={selected_open}
                                onClick={() => {
                                    const urls = selectedCollections.flatMap((collection) =>
                                        collection.items.map((item) => item.url).filter(Boolean)
                                    );
                                    requestOpenMany(urls, (urlsToOpen) => {
                                        for (const url of urlsToOpen) {
                                            window.browser.tabs.create({
                                                url,
                                                active: false,
                                            });
                                        }
                                    });
                                }}
                            >
                                {t("collections.open")}
                            </Button>
                            <Button
                                className="p-1"
                                variant={"ghost"}
                                ref={selected_openNewWindow}
                                onClick={() => {
                                    const urls = selectedCollections.flatMap((collection) =>
                                        collection.items.map((item) => item.url).filter(Boolean)
                                    );
                                    requestOpenMany(urls, (urlsToOpen) => {
                                        window.browser.windows.create({
                                            url: urlsToOpen,
                                            state: "normal",
                                        });
                                    });
                                }}
                            >
                                {t("collections.newWindow")}
                            </Button>
                            <Button
                                className="p-1"
                                variant={"ghost"}
                                ref={selected_openIncognito}
                                onClick={() => {
                                    const urls = selectedCollections.flatMap((collection) =>
                                        collection.items.map((item) => item.url).filter(Boolean)
                                    );
                                    requestOpenMany(urls, (urlsToOpen) => {
                                        window.browser.windows
                                            .create({
                                                url: urlsToOpen,
                                                state: "maximized",
                                                incognito: true,
                                            })
                                            .catch((e) => {
                                                toast.error(t("common.error"), {
                                                    description: e,
                                                });
                                            });
                                    });
                                }}
                            >
                                {t("collections.incognito")}
                            </Button>
                            <AlertDialogTrigger asChild ref={selected_deleteRef}>
                                <Button className="p-1" variant={"ghost"} size={"icon"}>
                                    <Trash />
                                </Button>
                            </AlertDialogTrigger>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="p-1"
                                        variant={"ghost"}
                                        size={"icon"}
                                        title={t("collections.moreActions")}
                                    >
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => copySelectedCollections()}>
                                        {t("collections.copyData")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openForCollections(selected)}>
                                        {t("collections.removeDuplicates")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                className="p-1"
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => setSelected([])}
                            >
                                <X />
                            </Button>
                        </div>
                    )}

                    {collectionData.length === 0 ? (
                        <div className="h-full overflow-hidden overflow-y-auto p-2">
                            <p>{t("collections.noCollections")}</p>
                        </div>
                    ) : visibleCollections.length === 0 && searchText ? (
                        <div className="h-full overflow-hidden overflow-y-auto p-2">
                            <p>{t("collections.noSearchResults", { query: search })}</p>
                        </div>
                    ) : (
                        <div
                            className="h-full overflow-hidden overflow-y-auto p-2"
                            ref={ref}
                            onScroll={(e) => {
                                setScrollPos(e.currentTarget.scrollTop);
                            }}
                        >
                            <Reorder.Group
                                axis="y"
                                layoutScroll
                                values={visibleCollections}
                                onReorder={(newOrder) => {
                                    if (canDrag) setCollectionOrder(newOrder);
                                }}
                                className="flex flex-col gap-2 p-1"
                            >
                                {visibleCollections.map((collection) => (
                                    <Collection
                                        key={collection.id}
                                        item={collection}
                                        canDrag={canDrag}
                                        isSelected={selected.includes(collection.id)}
                                        anySelected={selected.length > 0}
                                        changeSelected={changeSelected}
                                        onShiftPlusClick={onShiftPlusClick}
                                        requestOpenMany={requestOpenMany}
                                        onRemoveDuplicates={(collectionId) =>
                                            openForCollections([collectionId])
                                        }
                                        onDragEnd={() => {
                                            if (canDrag) {
                                                operations.changeCollectionOrder(
                                                    collectionOrder.map((item) => item.id)
                                                );
                                            }
                                        }}
                                    />
                                ))}
                            </Reorder.Group>
                        </div>
                    )}
                </div>
                <AlertDialogContent
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("collections.deleteCollectionsTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("collections.deleteCollectionsDescription", {
                                collectionCount: selected.length,
                                itemCount: selectedItemCount,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Label className="flex cursor-pointer flex-row items-center gap-1">
                        <Checkbox
                            className="rounded-md"
                            checked={deleteConfirmed}
                            onCheckedChange={() => setDeleteConfirmed((init) => !init)}
                        />
                        {t("collections.deleteCollectionsConfirm")}
                    </Label>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!deleteConfirmed}
                            onClick={() => {
                                if (deleteConfirmed) {
                                    operations.removeCollections(selected);
                                    setSelected([]);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("common.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {removeDuplicatesDialog}
            {openManyWarningDialog}
        </>
    );
};

export default CollectionView;
