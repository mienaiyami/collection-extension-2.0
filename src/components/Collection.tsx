import React from "react";
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

type PropType = {
    id: UUID;
    title: string;
    itemLen: number;
};

const Collection = (props: PropType) => {
    const {
        addToCollection,
        collectionData,
        removeCollections,
        openCollection,
    } = useAppContext();
    return (
        <ContextMenu>
            <ContextMenuTrigger
                className="w-full h-16 p-2 gap-2 rounded-md grid grid-cols-[15%_70%_15%] hover:bg-foreground/10 data-[state=open]:bg-foreground/10 transition-colors"
                tabIndex={0}
                onClick={(e) => {
                    openCollection(props.id);
                }}
            >
                <Button
                    variant={"ghost"}
                    className="w-full h-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        chrome.tabs
                            .query({
                                active: true,
                                currentWindow: true,
                            })
                            .then((tabs) => {
                                const tab = tabs[0];
                                addToCollection(props.id, {
                                    //todo, mayabve move id to fn?
                                    id: crypto.randomUUID(),
                                    date: new Date().toISOString(),
                                    // todo, maybe make a default img?
                                    img: tab.favIconUrl || "",
                                    title: tab.title || "title",
                                    url: tab.url || "",
                                });
                            });
                    }}
                >
                    <Plus />
                </Button>
                <div className="flex flex-col item-center justify-center">
                    <span className="text-lg">{props.title}</span>
                    <span className="text-xs text-muted-foreground">
                        {props.itemLen} {props.itemLen > 1 ? "Items" : "Item"}
                    </span>
                </div>
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
                        //todo test
                        (async () => {
                            const collection = collectionData.find(
                                (e) => e.id === props.id
                            );
                            if (collection)
                                for (
                                    let i = 0;
                                    i < collection.items.length;
                                    i++
                                ) {
                                    const url = collection.items[i].url;
                                    if (url)
                                        chrome.tabs.create({
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
                        //todo test
                        (async () => {
                            const collection = collectionData.find(
                                (e) => e.id === props.id
                            );
                            if (collection) {
                                const urls = collection.items.map((e) => e.url);
                                chrome.windows.create({
                                    url: urls,
                                    state: "normal",
                                });
                            }
                        })();
                    }}
                >
                    Open All in New Window
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        //todo test
                        (async () => {
                            const collection = collectionData.find(
                                (e) => e.id === props.id
                            );
                            if (collection) {
                                const urls = collection.items.map((e) => e.url);
                                chrome.windows.create({
                                    url: urls,
                                    state: "normal",
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
                        //todo test
                        (async () => {
                            const collection = collectionData.find(
                                (e) => e.id === props.id
                            );
                            if (collection) {
                                const data = collection.items
                                    .map((e) => e.url)
                                    .join("\n");
                                navigator.clipboard.writeText(data);
                            }
                        })();
                    }}
                >
                    Copy Data
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        //todo test
                        removeCollections(props.id);
                    }}
                    className="focus:text-destructive-foreground focus:bg-destructive"
                >
                    Delete Collection
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default Collection;
