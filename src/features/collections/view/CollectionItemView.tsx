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
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppContext } from "@/features/layout/App";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Reorder } from "framer-motion";
import { Copy, CopyPlus, FilePlus, Trash, X } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AddUrlManualDialog from "../AddUrlManualDialog";
import CollectionItem from "../item/CollectionItem";

const CollectionItemView = () => {
    const { collectionData, inCollectionView, openCollection } =
        useAppContext();
    const operations = useCollectionOperations();
    const { appSetting } = useAppSetting();
    const { t } = useTranslation();

    const [selected, setSelected] = useState<UUID[]>([]);

    const [itemsOrder, setItemsOrder] = useState<UUID[]>([]);
    // will be used to as starting point when using shift+click
    const [lastChanged, setLastChanged] = useState<{
        id: UUID;
        type: "select" | "deselect";
    } | null>(null);
    const selected_deleteRef = useRef<HTMLButtonElement>(null);
    const selected_open = useRef<HTMLButtonElement>(null);
    const selected_openNewWindow = useRef<HTMLButtonElement>(null);
    const selected_openIncognito = useRef<HTMLButtonElement>(null);
    const selected_copy = useRef<HTMLButtonElement>(null);
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

    const changeSelected = (id: UUID, checked: boolean) => {
        setLastChanged({
            id,
            type: checked ? "select" : "deselect",
        });
        setSelected((init) => {
            if (!checked) {
                const index = init.findIndex((e) => e === id);
                if (index >= 0) init.splice(index, 1);
            } else init.push(id);
            return [...init];
        });
    };

    const onShiftPlusClick = useCallback(
        (onItem: UUID) => {
            if (!lastChanged) return;
            const indexInMain = itemsOrder.findIndex((e) => e === onItem);
            const indexOfLastChanged = itemsOrder.findIndex(
                (e) => e === lastChanged.id
            );
            if (indexInMain === -1 || indexOfLastChanged === -1) return;
            const start = Math.min(indexInMain, indexOfLastChanged);
            const end = Math.max(indexInMain, indexOfLastChanged);
            // const selectedItems = itemsOrder.slice(start, end + 1);
            setSelected((init) => {
                const dup = [...init];
                if (lastChanged.type === "select") {
                    dup.push(...itemsOrder.slice(start, end + 1));
                } else {
                    for (let i = start; i <= end; i++) {
                        const index = dup.findIndex((e) => e === itemsOrder[i]);
                        if (index >= 0) dup.splice(index, 1);
                    }
                }
                return [...new Set(dup)];
            });
        },
        [itemsOrder, lastChanged]
    );

    useLayoutEffect(() => {
        setItemsOrder(currentCollection?.items.map((e) => e.id) || []);
    }, [currentCollection]);

    // todo : update for performance
    useLayoutEffect(() => {
        setSelected([]);
        const keyHandler = (e: KeyboardEvent) => {
            if (!currentCollection) return;
            const isTextInput =
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA" ||
                (document.activeElement as HTMLElement)?.isContentEditable;
            if (isTextInput) return;
            switch (e.code) {
                case "Delete":
                    selected_deleteRef.current?.click();
                    break;
                case "KeyN":
                    {
                        if (e.shiftKey) selected_openIncognito.current?.click();
                        else selected_openNewWindow.current?.click();
                    }
                    break;
                case "KeyT":
                    selected_open.current?.click();
                    break;
                case "Escape":
                    setSelected([]);
                    break;
                case "KeyC":
                    selected_copy.current?.click();
                    break;
                case "KeyA":
                    if (e.ctrlKey)
                        setSelected(currentCollection.items.map((e) => e.id));
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
                        return operations.addActiveTabToCollection(
                            inCollectionView
                        );
                }
            } else {
                console.error(
                    "onMessage: message is of unknown type.",
                    message
                );
            }
        };
        window.addEventListener("keydown", keyHandler);
        window.browser.runtime.onMessage.addListener(onMessage);
        return () => {
            window.removeEventListener("keydown", keyHandler);
            window.browser.runtime.onMessage.removeListener(onMessage);
        };
    }, [collectionData, inCollectionView, currentCollection, openCollection]);

    return currentCollection ? (
        <AlertDialog>
            <div className="grid min-h-full grid-rows-[3rem_auto]">
                {selected.length === 0 && (
                    <div className="grid h-full grid-cols-[1fr_1px_1fr_1px_0.4fr] items-center p-1">
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
                    <div className="flex h-full w-full flex-row items-center p-2">
                        <span className="p-1">
                            {selected.length} {t("collections.selected")}
                        </span>
                        <Button
                            className="ml-auto p-1"
                            variant={"ghost"}
                            ref={selected_open}
                            onClick={() => {
                                const items = currentCollection.items.filter(
                                    (e) => selected.includes(e.id)
                                );
                                if (items)
                                    for (let i = 0; i < items.length; i++) {
                                        const url = items[i].url;
                                        if (url)
                                            window.browser.tabs.create({
                                                url,
                                                active: false,
                                            });
                                    }
                            }}
                        >
                            {t("collections.open")}
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            ref={selected_openNewWindow}
                            onClick={() => {
                                const items = currentCollection.items.filter(
                                    (e) => selected.includes(e.id)
                                );
                                if (items)
                                    window.browser.windows.create({
                                        url: items.map((e) => e.url),
                                        state: "normal",
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
                                const items = currentCollection.items.filter(
                                    (e) => selected.includes(e.id)
                                );
                                if (items)
                                    window.browser.windows
                                        .create({
                                            url: items.map((e) => e.url),
                                            state: "maximized",
                                            incognito: true,
                                        })
                                        .catch((e) => {
                                            toast.error(t("common.error"), {
                                                description: e,
                                            });
                                        });
                            }}
                        >
                            {t("collections.incognito")}
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            size={"icon"}
                            ref={selected_copy}
                            title={t("collections.copyData")}
                            onClick={() => {
                                const items = currentCollection.items.filter(
                                    (e) => selected.includes(e.id)
                                );
                                if (items && items.length > 0) {
                                    navigator.clipboard.writeText(
                                        window.formatCopyData(
                                            appSetting.copyDataFormat,
                                            items,
                                            currentCollection.title
                                        )
                                    );
                                    toast.success(
                                        t("messages.copiedItems", {
                                            count: items.length,
                                        })
                                    );
                                }
                            }}
                        >
                            <Copy />
                        </Button>

                        <AlertDialogTrigger asChild ref={selected_deleteRef}>
                            <Button
                                className="p-1"
                                variant={"ghost"}
                                size={"icon"}
                            >
                                <Trash />
                            </Button>
                        </AlertDialogTrigger>
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
                        values={itemsOrder}
                        // this is called each time an item is reordered in ui, cant be used to update storage
                        onReorder={(e) => {
                            setItemsOrder(e);
                        }}
                        className="flex flex-col gap-2 p-3"
                    >
                        {itemsOrder.length <= 0 ? (
                            <p>{t("collections.noItems")}</p>
                        ) : (
                            itemsOrder.map((id) => {
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
                                        onDragEnd={() => {
                                            if (inCollectionView)
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
                    <AlertDialogTitle>
                        {t("collections.deleteUrls")}
                    </AlertDialogTitle>
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
                                operations.removeFromCollection(
                                    inCollectionView,
                                    selected
                                );
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {t("common.delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ) : (
        <p>{t("collections.collectionNotFound")}</p>
    );
};

export default CollectionItemView;
