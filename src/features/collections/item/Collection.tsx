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
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useAppContext } from "@/features/layout/App";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Reorder, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

/** Narrow row props for the collection list — no search-sort timestamps leak here. */
type CollectionRowItem = {
    id: UUID;
    title: string;
    itemLen: number;
    matchedViaItems?: boolean;
};

type PropType = {
    item: CollectionRowItem;
    onDragEnd: () => void;
    canDrag: boolean;
    isSelected: boolean;
    anySelected: boolean;
    changeSelected: (id: UUID, checked: boolean) => void;
    onShiftPlusClick: (id: UUID) => void;
    requestOpenMany: (urls: string[], open: (urls: string[]) => void) => void;
    onRemoveDuplicates: (collectionId: UUID) => void;
};

const Collection = ({
    item,
    onDragEnd,
    canDrag,
    isSelected,
    anySelected,
    changeSelected,
    onShiftPlusClick,
    requestOpenMany,
    onRemoveDuplicates,
}: PropType) => {
    const { collectionData, openCollection } = useAppContext();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    const { appSetting } = useAppSetting();
    const draggingRef = useRef(false);

    return (
        <Reorder.Item
            value={item}
            whileDrag={{ backdropFilter: "blur(4px)" }}
            dragListener={canDrag && !anySelected}
            onDragStart={() => {
                draggingRef.current = true;
            }}
            onDragEnd={() => {
                draggingRef.current = false;
                if (canDrag) onDragEnd();
            }}
            transition={{ duration: 0.2 }}
        >
            <AlertDialog>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <motion.div
                            className={`handle grid h-16 w-full grid-cols-[15%_60%_15%_10%] rounded-md border hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 ${
                                isSelected ? "ring-2 ring-purple-700 dark:ring-purple-400" : ""
                            }`}
                            data-collection-id={item.id}
                            tabIndex={0}
                            onClick={() => {
                                !draggingRef.current && openCollection(item.id);
                            }}
                            onKeyDown={(e) => {
                                if ([" ", "Enter"].includes(e.key)) {
                                    e.preventDefault();
                                    if (e.target instanceof HTMLElement) openCollection(item.id);
                                }
                            }}
                        >
                            <Button
                                variant={"ghost"}
                                className="h-full w-full"
                                title={t("collections.addCurrentTab")}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                }}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    operations.addActiveTabToCollection(item.id);
                                }}
                            >
                                <Plus />
                            </Button>
                            <div className="flex flex-col justify-center p-2">
                                <span className="truncate text-lg" title={item.title}>
                                    {item.title}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {item.itemLen}{" "}
                                    {item.itemLen > 1
                                        ? t("collections.items")
                                        : t("collections.item")}
                                    {item.matchedViaItems ? (
                                        <span className="ml-1 text-primary">
                                            · {t("collections.matchedViaItems")}
                                        </span>
                                    ) : null}
                                </span>
                            </div>
                            <div />
                            <div className="grid h-full w-full cursor-default place-items-center">
                                <label
                                    onMouseUp={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.shiftKeyHeld) {
                                            e.preventDefault();
                                            onShiftPlusClick(item.id);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if ([" ", "Enter"].includes(e.key)) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (e.shiftKey) {
                                                onShiftPlusClick(item.id);
                                            } else e.currentTarget.click();
                                        }
                                    }}
                                    tabIndex={0}
                                    className="group flex h-full items-center justify-center focus:outline-none"
                                >
                                    <div
                                        className={`rounded-md border group-hover:border-foreground/20 ${
                                            isSelected ? "bg-purple-700 dark:bg-purple-400" : ""
                                        } ring-white group-focus:ring-2`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                changeSelected(item.id, e.currentTarget.checked);
                                            }}
                                        />
                                        <Check
                                            className="text-white"
                                            style={{
                                                visibility: isSelected ? "visible" : "hidden",
                                            }}
                                        />
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    </ContextMenuTrigger>
                    <ContextMenuContent
                        className="w-62"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            if (e.target instanceof HTMLElement) e.target.click();
                        }}
                    >
                        <ContextMenuItem
                            onClick={() => {
                                const collection = collectionData.find((e) => e.id === item.id);
                                if (!collection) return;
                                const urls = collection.items.map((e) => e.url).filter(Boolean);
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
                            {t("collections.openAll")}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                const collection = collectionData.find((e) => e.id === item.id);
                                if (!collection) return;
                                const urls = collection.items.map((e) => e.url).filter(Boolean);
                                requestOpenMany(urls, (urlsToOpen) => {
                                    window.browser.windows.create({
                                        url: urlsToOpen,
                                        state: "maximized",
                                    });
                                });
                            }}
                        >
                            {t("collections.openAllInNewWindow")}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                const collection = collectionData.find((e) => e.id === item.id);
                                if (!collection) return;
                                const urls = collection.items.map((e) => e.url).filter(Boolean);
                                requestOpenMany(urls, (urlsToOpen) => {
                                    window.browser.windows.create({
                                        url: urlsToOpen,
                                        state: "maximized",
                                        incognito: true,
                                    });
                                });
                            }}
                        >
                            {t("collections.openAllInIncognitoWindow")}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                            onSelect={() => {
                                onRemoveDuplicates(item.id);
                            }}
                        >
                            {t("collections.removeDuplicates")}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                (async () => {
                                    const collection = collectionData.find((e) => e.id === item.id);
                                    if (collection) {
                                        const data = window.formatCopyData(
                                            appSetting.copyDataFormat,
                                            collection.items,
                                            collection.title
                                        );
                                        navigator.clipboard.writeText(data);
                                    }
                                })();
                            }}
                        >
                            {t("collections.copyData")}
                        </ContextMenuItem>
                        <ContextMenuItem asChild>
                            <AlertDialogTrigger asChild>
                                <ContextMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
                                    {t("collections.deleteCollection")}
                                </ContextMenuItem>
                            </AlertDialogTrigger>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("collections.deleteCollectionTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("collections.deleteCollectionDescription", {
                                title: item.title,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                operations.removeCollections(item.id);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("common.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Reorder.Item>
    );
};

export default Collection;
