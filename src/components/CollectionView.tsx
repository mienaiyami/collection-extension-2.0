import React from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";
import { ScrollArea } from "./ui/scroll-area";

const CollectionView = () => {
    const { collectionData, makeNewCollection } = useAppContext();
    return (
        <div className="h-full grid gap-2 grid-rows-[8%_auto]">
            <div className="p-3 grid grid-cols-2 h-full items-center">
                <Button
                    variant={"ghost"}
                    onClick={() => {
                        //todo, open and focus name input
                        makeNewCollection(new Date().toLocaleString());
                    }}
                >
                    New Empty
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
                                makeNewCollection(date.toLocaleString(), items);
                            });
                    }}
                >
                    New from Opened tabs
                </Button>
            </div>
            <div className="h-full overflow-hidden overflow-y-auto">
                <div className="p-3 flex flex-col gap-2">
                    {collectionData.length <= 0 ? (
                        <p>No Collections</p>
                    ) : (
                        collectionData.map((e) => (
                            <Collection
                                key={e.id}
                                id={e.id}
                                itemLen={e.items.length}
                                title={e.title}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionView;
