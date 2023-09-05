import React, { useMemo } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import CollectionItem from "./CollectionItem";
import { ScrollArea } from "./ui/scroll-area";

const CollectionItemView = () => {
    const { collectionData, inCollectionView, addToCollection } =
        useAppContext();
    const currentCollection = useMemo(() => {
        if (inCollectionView) {
            return collectionData.find((e) => e.id === inCollectionView);
        }
    }, [collectionData, inCollectionView]);

    return currentCollection ? (
        <div className=" h-full grid gap-2 grid-rows-[8%_auto]">
            <div className="p-3 grid grid-cols-2 h-full items-center">
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
                                addToCollection(currentCollection.id, items);
                            });
                    }}
                >
                    Add All Opened Tabs
                </Button>
            </div>

            <div className="h-full overflow-hidden overflow-y-auto">
                <div className="p-3 flex flex-col gap-2">
                    {currentCollection.items.length <= 0 ? (
                        <p>No Items</p>
                    ) : (
                        currentCollection.items.map((e) => (
                            <CollectionItem {...e} key={e.id} />
                        ))
                    )}
                </div>
            </div>
        </div>
    ) : null;
};

export default CollectionItemView;
