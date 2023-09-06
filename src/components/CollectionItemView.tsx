import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import CollectionItem from "./CollectionItem";
import { Trash, X } from "lucide-react";

const CollectionItemView = () => {
    const {
        collectionData,
        inCollectionView,
        addToCollection,
        removeFromCollection,
    } = useAppContext();

    const [selected, setSelected] = useState<UUID[]>([]);

    const toggleSelected = (id: UUID) => {
        setSelected((init) => {
            const index = init.findIndex((e) => e === id);
            if (index >= 0) init.splice(index, 1);
            else init.push(id);
            return [...init];
        });
    };

    const currentCollection = useMemo(() => {
        if (inCollectionView) {
            return collectionData.find((e) => e.id === inCollectionView);
        }
    }, [collectionData, inCollectionView]);

    return currentCollection ? (
        <div className=" h-full grid gap-2 grid-rows-[8%_auto]">
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
                                    const item: CollectionItem = {
                                        date: date.toISOString(),
                                        id: crypto.randomUUID(),
                                        img: tabs[0].favIconUrl || "",
                                        title: tabs[0].title || "title",
                                        url: tabs[0].url || "",
                                    };
                                    addToCollection(currentCollection.id, item);
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
                                    const items: CollectionItem[] = tabs.map(
                                        (e) => ({
                                            date: date.toISOString(),
                                            id: crypto.randomUUID(),
                                            img: e.favIconUrl || "",
                                            title: e.title || "title",
                                            url: e.url || "",
                                        })
                                    );
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
                            // todo, test
                            const items = collectionData
                                .find((e) => e.id === inCollectionView)
                                ?.items.filter((e) => selected.includes(e.id));
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
                            // todo, test
                            const items = collectionData
                                .find((e) => e.id === inCollectionView)
                                ?.items.filter((e) => selected.includes(e.id));
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
                            // todo, test
                            const items = collectionData
                                .find((e) => e.id === inCollectionView)
                                ?.items.filter((e) => selected.includes(e.id));
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
                            // todo, test
                            inCollectionView &&
                                removeFromCollection(
                                    inCollectionView,
                                    selected
                                );
                        }}
                    >
                        <Trash />
                    </Button>
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
                        currentCollection.items.map((e) => (
                            <CollectionItem
                                {...e}
                                key={e.id}
                                toggleSelected={toggleSelected}
                                isSelected={selected.includes(e.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    ) : null;
};

export default CollectionItemView;
