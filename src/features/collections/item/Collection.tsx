import { useRef } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppContext } from "@/features/layout/App";
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
import { Reorder, motion } from "framer-motion";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useTranslation } from "react-i18next";

type PropType = {
    id: UUID;
    title: string;
    itemLen: number;
};

const Collection = ({ item, onDragEnd }: { item: PropType; onDragEnd: () => void }) => {
    const { collectionData, openCollection } = useAppContext();
    const operations = useCollectionOperations();
    const { t } = useTranslation();

    const { appSetting } = useAppSetting();

    const draggingRef = useRef(false);

    return (
        <Reorder.Item
            value={item}
            whileDrag={{ backdropFilter: "blur(4px)" }}
            onDragStart={() => {
                draggingRef.current = true;
            }}
            onDragEnd={() => {
                draggingRef.current = false;
                onDragEnd();
            }}
            transition={{ duration: 0.2 }}
        >
            <AlertDialog>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <motion.div
                            className={`collection handle w-full h-16 rounded-md grid grid-cols-[15%_70%_15%] hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border`}
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
                                className="w-full h-full"
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
                            <div className="p-2 flex flex-col item-center justify-center">
                                <span className="text-lg truncate" title={item.title}>
                                    {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {item.itemLen}{" "}
                                    {item.itemLen > 1
                                        ? t("collections.items")
                                        : t("collections.item")}
                                </span>
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
                                (async () => {
                                    const collection = collectionData.find((e) => e.id === item.id);
                                    if (collection)
                                        for (let i = 0; i < collection.items.length; i++) {
                                            const url = collection.items[i].url;
                                            if (url)
                                                window.browser.tabs.create({
                                                    url,
                                                    active: false,
                                                });
                                        }
                                })();
                            }}
                        >
                            {t("collections.openAll")}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                (async () => {
                                    const collection = collectionData.find((e) => e.id === item.id);
                                    if (collection) {
                                        const urls = collection.items.map((e) => e.url);
                                        window.browser.windows.create({
                                            url: urls,
                                            state: "maximized",
                                        });
                                    }
                                })();
                            }}
                        >
                            {t("collections.openAllInNewWindow")}
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                (async () => {
                                    const collection = collectionData.find((e) => e.id === item.id);
                                    if (collection) {
                                        const urls = collection.items.map((e) => e.url);
                                        window.browser.windows.create({
                                            url: urls,
                                            state: "maximized",
                                            incognito: true,
                                        });
                                    }
                                })();
                            }}
                        >
                            {t("collections.openAllInIncognitoWindow")}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
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
                                <ContextMenuItem className="focus:text-destructive-foreground focus:bg-destructive">
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
                            {t("collections.deleteCollectionDescription", { title: item.title })}
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
