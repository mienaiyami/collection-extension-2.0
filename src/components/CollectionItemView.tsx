import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import CollectionItem from "./CollectionItem";
import { Copy, Trash, X } from "lucide-react";
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
import { getImgFromTab } from "@/utils";
import { Reorder } from "framer-motion";
const CollectionItemView = () => {
    const {
        collectionData,
        inCollectionView,
        addToCollection,
        removeFromCollection,
        changeCollectionItemOrder,
        openCollection,
    } = useAppContext();

    const [selected, setSelected] = useState<UUID[]>([]);

    const [itemsOrder, setItemsOrder] = useState<UUID[]>([]);
    const selected_deleteRef = useRef<HTMLButtonElement>(null);
    const selected_open = useRef<HTMLButtonElement>(null);
    const selected_openNewWindow = useRef<HTMLButtonElement>(null);
    const selected_openIncognito = useRef<HTMLButtonElement>(null);
    const selected_copy = useRef<HTMLButtonElement>(null);
    const changeSelected = (id: UUID, checked: boolean) => {
        setSelected((init) => {
            if (!checked) {
                const index = init.findIndex((e) => e === id);
                if (index >= 0) init.splice(index, 1);
            } else init.push(id);
            return [...init];
        });
    };

    const currentCollection = useMemo(() => {
        if (inCollectionView) {
            return collectionData.find((e) => e.id === inCollectionView);
        }
    }, [collectionData, inCollectionView]);

    useLayoutEffect(() => {
        setItemsOrder(currentCollection?.items.map((e) => e.id) || []);
    }, [currentCollection]);

    useLayoutEffect(() => {
        setSelected([]);
        const keyHandler = (e: KeyboardEvent) => {
            if (!currentCollection) return;
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
        window.addEventListener("keydown", keyHandler);
        return () => {
            window.removeEventListener("keydown", keyHandler);
        };
    }, [collectionData, inCollectionView, currentCollection, openCollection]);

    return currentCollection ? (
        <AlertDialog>
            <div className="min-h-full grid grid-rows-[3rem_auto]">
                {selected.length === 0 && (
                    <div className="p-1 grid grid-cols-2 h-full items-center">
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                chrome.tabs
                                    .query({
                                        currentWindow: true,
                                        active: true,
                                    })
                                    .then((tabs) => {
                                        const date = new Date();
                                        if (tabs[0]) {
                                            getImgFromTab(tabs[0]).then(
                                                (img) => {
                                                    const item: CollectionItem =
                                                        {
                                                            date: date.toISOString(),
                                                            id: crypto.randomUUID(),
                                                            img,
                                                            title:
                                                                tabs[0].title ||
                                                                "title",
                                                            url:
                                                                tabs[0].url ||
                                                                "",
                                                        };
                                                    addToCollection(
                                                        currentCollection.id,
                                                        item
                                                    );
                                                }
                                            );
                                        }
                                    });
                            }}
                        >
                            Add Current Tab
                        </Button>
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                chrome.tabs
                                    .query({
                                        currentWindow: true,
                                    })
                                    .then((tabs) => {
                                        const date = new Date();
                                        const items: CollectionItem[] = [];
                                        let done = 0;
                                        tabs.forEach((tab) => {
                                            const add = (img: string) => {
                                                items.push({
                                                    date: date.toISOString(),
                                                    id: crypto.randomUUID(),
                                                    img,
                                                    title: tab.title || "title",
                                                    url: tab.url || "",
                                                });
                                                done++;
                                                if (done === tabs.length)
                                                    addToCollection(
                                                        currentCollection.id,
                                                        items
                                                    );
                                            };
                                            // need this because sleeping tabs does not execute script to get img
                                            // reducing time from 2000
                                            const timeout = setTimeout(() => {
                                                add(tab.favIconUrl || "");
                                            }, 500);
                                            getImgFromTab(tab).then((img) => {
                                                clearTimeout(timeout);
                                                add(img);
                                            });
                                        });
                                    });
                            }}
                        >
                            Add All Opened Tabs
                        </Button>
                    </div>
                )}
                {selected.length > 0 && (
                    <div className="p-2 flex flex-row w-full h-full items-center">
                        <span className="p-1">{selected.length} selected</span>
                        <Button
                            className="p-1 ml-auto"
                            variant={"ghost"}
                            ref={selected_open}
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    for (let i = 0; i < items.length; i++) {
                                        const url = items[i].url;
                                        if (url)
                                            chrome.tabs.create({
                                                url,
                                                active: false,
                                            });
                                    }
                            }}
                        >
                            Open
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            ref={selected_openNewWindow}
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    chrome.windows.create({
                                        url: items.map((e) => e.url),
                                        //todo check
                                        state: "normal",
                                    });
                            }}
                        >
                            New Window
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            ref={selected_openIncognito}
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    chrome.windows.create({
                                        url: items.map((e) => e.url),
                                        state: "maximized",
                                        incognito: true,
                                    });
                            }}
                        >
                            Incognito
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            size={"icon"}
                            ref={selected_copy}
                            title="Copy"
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    //todo add toast
                                    navigator.clipboard.writeText(
                                        items.map((e) => e.url).join("\n")
                                    );
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
                        onReorder={(e) => setItemsOrder(e)}
                        className="p-3 flex flex-col gap-2"
                    >
                        {currentCollection.items.length <= 0 ? (
                            <p>No Items</p>
                        ) : (
                            currentCollection.items
                                .map((e, i) => (
                                    <CollectionItem
                                        {...e}
                                        key={e.id}
                                        changeSelected={changeSelected}
                                        isSelected={selected.includes(e.id)}
                                        anySelected={selected.length > 0}
                                        index={i}
                                        onDragEnd={() => {
                                            inCollectionView &&
                                                changeCollectionItemOrder(
                                                    inCollectionView,
                                                    itemsOrder
                                                );
                                        }}
                                    />
                                ))
                                .sort(
                                    (a, b) =>
                                        itemsOrder.indexOf(a.props.id) -
                                        itemsOrder.indexOf(b.props.id)
                                )
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
                    <AlertDialogTitle>Delete URLs?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete {selected.length} URLs.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            // todo, test

                            inCollectionView &&
                                removeFromCollection(
                                    inCollectionView,
                                    selected
                                );
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ) : null;
};

export default CollectionItemView;
