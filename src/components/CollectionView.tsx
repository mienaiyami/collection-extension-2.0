import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";
import { getImgFromTab } from "@/utils";

const CollectionView = () => {
    const { collectionData, makeNewCollection } = useAppContext();
    return (
        <div className="min-h-full grid grid-rows-[8%_auto]">
            <div className="p-1 grid grid-cols-2 h-full items-center">
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
                                makeNewCollection(date.toLocaleString(), items);
                            });
                    }}
                >
                    New from Opened tabs
                </Button>
            </div>
            <div className="p-2 h-full overflow-hidden overflow-y-auto">
                <div className="p-1 flex flex-col gap-2">
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
