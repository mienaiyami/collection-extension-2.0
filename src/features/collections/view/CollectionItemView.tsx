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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRemoveDuplicatesDialog } from "@/features/collections/duplicates/use-remove-duplicates-dialog";
import { useAppContext } from "@/features/layout/App";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Reorder } from "framer-motion";
import { CopyPlus, FilePlus, MoreHorizontal, Trash, X } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AddUrlManualDialog from "../AddUrlManualDialog";
import CollectionItem from "../item/CollectionItem";
import SearchSortControls from "../search-sort/search-sort-controls";
import { useCollectionItemSearchSort } from "../search-sort/use-collection-item-search-sort";
import { applyRangeSelection, pruneSelectionToVisible } from "../selection/range-select";
import { useOpenManyWarning } from "../use-open-many-warning";

const CollectionItemView = () => {
    const { collectionData, inCollectionView, openCollection } = useAppContext();
    const operations = useCollectionOperations();
    const { appSetting } = useAppSetting();
    const { t } = useTranslation();

    const [selected, setSelected] = useState<UUID[]>([]);

    const [itemsOrder, setItemsOrder] = useState<UUID[]>([]);
    /* Anchor for Shift+click range selection (select vs deselect mode). */
    const [lastChanged, setLastChanged] = useState<{
        id: UUID;
        type: "select" | "deselect";
    } | null>(null);
    const selected_deleteRef = useRef<HTMLButtonElement>(null);
    const selected_open = useRef<HTMLButtonElement>(null);
    const selected_openNewWindow = useRef<HTMLButtonElement>(null);
    const selected_openIncognito = useRef<HTMLButtonElement>(null);
    const currentCollection = useMemo(() => {
        if (inCollectionView) {
            return collectionData.find((e) => e.id === inCollectionView);
        }
    }, [collectionData, inCollectionView]);
    const currentCollectionItemsMap = useMemo(() => {
        if (currentCollection) {
            return new Map(currentCollection.items.map((e) => [e.id, e]));
        }
    }, [currentCollection]);

    const { canDrag, controlsProps, search, searchText, visibleItemsOrder } =
        useCollectionItemSearchSort(itemsOrder, currentCollectionItemsMap);

    const { requestOpenMany, openManyWarningDialog } = useOpenManyWarning();
    const { openForCollections, removeDuplicatesDialog } = useRemoveDuplicatesDialog();

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
        setSelected((init) =>
            applyRangeSelection(init, visibleItemsOrder, lastChanged.id, onItem, lastChanged.type)
        );
    };

    const copySelectedItems = () => {
        if (!currentCollection) return;
        const items = currentCollection.items.filter((e) => selected.includes(e.id));
        if (items.length === 0) return;
        navigator.clipboard.writeText(
            window.formatCopyData(appSetting.copyDataFormat, items, currentCollection.title)
        );
        toast.success(
            t("messages.copiedItems", {
                count: items.length,
            })
        );
    };
    const copySelectedItemsRef = useRef(copySelectedItems);
    copySelectedItemsRef.current = copySelectedItems;

    useLayoutEffect(() => {
        setItemsOrder(currentCollection?.items.map((e) => e.id) || []);
    }, [currentCollection]);

    /* Clear selection when opening a different collection. */
    useLayoutEffect(() => {
        setSelected([]);
    }, [inCollectionView]);

    /* Drop selection that fell out of the visible (filtered) list. */
    useLayoutEffect(() => {
        setSelected((prev) => pruneSelectionToVisible(prev, visibleItemsOrder));
    }, [visibleItemsOrder]);

    useLayoutEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (!currentCollection) return;
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
                    {
                        if (e.shiftKey) selected_openIncognito.current?.click();
                        else selected_openNewWindow.current?.click();
                    }
                    break;
                case "KeyT":
                    if (selected.length > 0) selected_open.current?.click();
                    break;
                case "Escape":
                    setSelected([]);
                    break;
                case "KeyC":
                    if (selected.length > 0) copySelectedItemsRef.current();
                    break;
                case "KeyA":
                    if (e.ctrlKey) {
                        e.preventDefault();
                        setSelected(visibleItemsOrder);
                    }
                    break;
                case "ArrowLeft":
                    if (e.altKey) openCollection(null);
                    break;
                default:
                    break;
            }
        };
        const onMessage = (message: unknown) => {
            if (!message) {
                console.error("onMessage: message is undefined.");
                return;
            }
            //! this relies on inCollectionView to work, so keep in mind before moving to background.ts
            if (typeof message === "object" && "type" in message) {
                if (message.type === "add-current-tab-to-active-collection") {
                    if (inCollectionView)
                        return operations.addActiveTabToCollection(inCollectionView);
                }
            } else {
                console.error("onMessage: message is of unknown type.", message);
            }
        };
        window.addEventListener("keydown", keyHandler);
        window.browser.runtime.onMessage.addListener(onMessage);
        return () => {
            window.removeEventListener("keydown", keyHandler);
            window.browser.runtime.onMessage.removeListener(onMessage);
        };
    }, [
        collectionData,
        inCollectionView,
        currentCollection,
        openCollection,
        selected.length,
        visibleItemsOrder,
        operations.addActiveTabToCollection,
    ]);

    return currentCollection ? (
        <>
            <AlertDialog>
                <div className="grid min-h-full grid-rows-[auto_auto_1fr]">
                    <SearchSortControls {...controlsProps} />
                    {selected.length === 0 && (
                        <div className="grid h-12 grid-cols-[1fr_1px_1fr_1px_0.4fr] items-center border-border border-b p-1">
                            <TooltipProvider
                                disableHoverableContent
                                delayDuration={200}
                                skipDelayDuration={500}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            onClick={() => {
                                                operations.addActiveTabToCollection(
                                                    currentCollection.id
                                                );
                                            }}
                                            // title="Add current tab to collection"
                                        >
                                            <FilePlus />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        {t("tooltips.addCurrentTab")}
                                    </TooltipContent>
                                </Tooltip>
                                <Separator orientation="vertical" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={"ghost"}
                                            onClick={() => {
                                                operations.addAllTabsToCollection(
                                                    currentCollection.id
                                                );
                                            }}
                                            // title="Add all opened tabs to collection"
                                        >
                                            <CopyPlus />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        {t("tooltips.addAllTabs")}
                                    </TooltipContent>
                                </Tooltip>
                                <Separator orientation="vertical" />
                                <AddUrlManualDialog />
                            </TooltipProvider>
                        </div>
                    )}
                    {selected.length > 0 && (
                        <div className="flex h-12 w-full flex-row items-center border-border border-b p-1">
                            <span className="p-1">
                                {selected.length} {t("collections.selected")}
                            </span>
                            <Button
                                className="ml-auto p-1"
                                variant={"ghost"}
                                ref={selected_open}
                                onClick={() => {
                                    const items = currentCollection.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                    const urls = items.map((e) => e.url).filter(Boolean);
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
                                    const items = currentCollection.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                    const urls = items.map((e) => e.url).filter(Boolean);
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
                                    const items = currentCollection.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                    const urls = items.map((e) => e.url).filter(Boolean);
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
                                    <DropdownMenuItem onSelect={() => copySelectedItems()}>
                                        {t("collections.copyData")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            if (inCollectionView)
                                                openForCollections([inCollectionView]);
                                        }}
                                    >
                                        {t("collections.removeDuplicates")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                className="p-1"
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => {
                                    setSelected([]);
                                }}
                            >
                                <X />
                            </Button>
                        </div>
                    )}
                    <div className="h-full overflow-hidden overflow-y-auto">
                        <Reorder.Group
                            values={visibleItemsOrder}
                            // this is called each time an item is reordered in ui, cant be used to update storage
                            onReorder={(e) => {
                                if (canDrag) setItemsOrder(e);
                            }}
                            className="flex flex-col gap-2 p-3"
                        >
                            {itemsOrder.length <= 0 ? (
                                <p>{t("collections.noItems")}</p>
                            ) : visibleItemsOrder.length <= 0 && searchText ? (
                                <p>{t("collections.noSearchResults", { query: search })}</p>
                            ) : (
                                visibleItemsOrder.map((id) => {
                                    const e = currentCollectionItemsMap?.get(id);
                                    if (!e) return null;
                                    return (
                                        <CollectionItem
                                            {...e}
                                            key={e.id}
                                            changeSelected={changeSelected}
                                            isSelected={selected.includes(e.id)}
                                            anySelected={selected.length > 0}
                                            onShiftPlusClick={onShiftPlusClick}
                                            canDrag={canDrag}
                                            onDragEnd={() => {
                                                if (canDrag && inCollectionView)
                                                    operations.changeCollectionItemOrder(
                                                        inCollectionView,
                                                        itemsOrder
                                                    );
                                            }}
                                        />
                                    );
                                })
                            )}
                        </Reorder.Group>
                    </div>
                </div>
                <AlertDialogContent
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("collections.deleteUrls")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("collections.deleteUrlsDescription", {
                                count: selected.length,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                inCollectionView &&
                                    operations.removeFromCollection(inCollectionView, selected);
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
    ) : (
        <p>{t("collections.collectionNotFound")}</p>
    );
};

export default CollectionItemView;
