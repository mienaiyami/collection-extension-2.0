import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";
import { getImgFromTab } from "@/utils";

const CollectionView = () => {
    const { collectionData, makeNewCollection ,setScrollPos,scrollPos} = useAppContext();

    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(()=>{
        ref.current?.scrollTo(0,scrollPos)
    },[])

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
                                            makeNewCollection(
                                                date.toLocaleString(),
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
                    New from Opened tabs
                </Button>
            </div>
            <div className="p-2 h-full overflow-hidden overflow-y-auto" ref={ref} onScroll={(e)=>{
                setScrollPos(e.currentTarget.scrollTop);
            }}>
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
