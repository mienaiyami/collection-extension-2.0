import React from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";

const CollectionView = () => {
    const { collectionData, makeNewCollection } = useAppContext();
    return (
        <div className="p-3">
            <div className="grid grid-cols-2 mb-2">
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
            <div>
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
    );
};

export default CollectionView;
