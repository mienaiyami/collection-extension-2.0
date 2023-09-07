import React, { useLayoutEffect, useMemo, useState } from "react";
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
const CollectionItemView = () => {
    const {
        collectionData,
        inCollectionView,
        addToCollection,
        removeFromCollection,
    } = useAppContext();

    const [selected, setSelected] = useState<UUID[]>([]);

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
        setSelected([]);
    }, [collectionData, inCollectionView]);

    return currentCollection ? (
        <AlertDialog>
            <div className="min-h-full grid grid-rows-[8%_auto]">
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
                                        tabs.forEach((tab) => {
                                            getImgFromTab(tab).then((img) => {
                                                items.push({
                                                    date: date.toISOString(),
                                                    id: crypto.randomUUID(),
                                                    img,
                                                    title: tab.title || "title",
                                                    url: tab.url || "",
                                                });
                                            });
                                        });
                                        addToCollection(
                                            currentCollection.id,
                                            items
                                        );
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
                                    });
                            }}
                        >
                            New Window
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
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
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    navigator.clipboard.writeText(
                                        items.map((e) => e.url).join("\n")
                                    );
                            }}
                        >
                            <Copy />
                        </Button>

                        <AlertDialogTrigger>
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
                    <div className="p-3 flex flex-col gap-2">
                        {currentCollection.items.length <= 0 ? (
                            <p>No Items</p>
                        ) : (
                            currentCollection.items.map((e, i) => (
                                <CollectionItem
                                    {...e}
                                    key={e.id}
                                    changeSelected={changeSelected}
                                    isSelected={selected.includes(e.id)}
                                    index={i}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
            <AlertDialogContent>
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
