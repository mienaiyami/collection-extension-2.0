import { useRef } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./ui/context-menu";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useAppContext } from "@/App";
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
} from "./ui/alert-dialog";
import { Reorder, motion } from "framer-motion";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";

type PropType = {
    id: UUID;
    title: string;
    itemLen: number;
};

const Collection = ({ item, onDragEnd }: { item: PropType; onDragEnd: () => void }) => {
    const { collectionData, openCollection } = useAppContext();
    const operations = useCollectionOperations();

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
                                title="Add Current Tab"
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
                                    {item.itemLen} {item.itemLen > 1 ? "Items" : "Item"}
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
                            Open All
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
                            Open All in New Window
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
                            Open All in Incognito Window
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                            onClick={() => {
                                (async () => {
                                    const collection = collectionData.find((e) => e.id === item.id);
                                    if (collection) {
                                        const data = window.formatCopyData(
                                            appSetting.copyDataFormat,
                                            collection.items
                                        );
                                        navigator.clipboard.writeText(data);
                                    }
                                })();
                            }}
                        >
                            Copy Data
                        </ContextMenuItem>
                        <ContextMenuItem asChild>
                            <AlertDialogTrigger asChild>
                                <ContextMenuItem className="focus:text-destructive-foreground focus:bg-destructive">
                                    Delete Collection
                                </ContextMenuItem>
                            </AlertDialogTrigger>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            collection '{item.title}
                            '.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                operations.removeCollections(item.id);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Reorder.Item>
    );
};

export default Collection;
