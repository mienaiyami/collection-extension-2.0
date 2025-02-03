import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";
import { Reorder } from "framer-motion";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";

const CollectionView = () => {
    const { collectionData, setScrollPos, scrollPos, setOpenColOnCreate } = useAppContext();
    const operations = useCollectionOperations();
    const [collectionOrder, setCollectionOrder] = useState<
        { id: UUID; title: string; itemLen: number }[]
    >([]);
    useLayoutEffect(() => {
        setCollectionOrder(
            collectionData.map((e) => ({
                id: e.id,
                title: e.title,
                itemLen: e.items.length,
            }))
        );
    }, [collectionData]);
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const timeout = setTimeout(() => {
            ref.current?.scrollTo({
                top: scrollPos,
            });
        }, 0);
        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="min-h-full grid grid-rows-[3rem_auto]">
            <div className="p-1 grid grid-cols-2 h-full items-center">
                <Button
                    variant={"ghost"}
                    onClick={async () => {
                        //todo, open and focus name input
                        const response = await operations.makeNewCollection(
                            new Date().toLocaleString()
                        );
                        if (response.success) {
                            setOpenColOnCreate(response.data.collection.id);
                        }
                    }}
                >
                    New Empty
                </Button>
                <Button
                    variant={"ghost"}
                    onClick={async () => {
                        operations.makeNewCollection(new Date().toLocaleString(), [], {
                            activeWindowId: (await window.browser.windows.getCurrent()).id,
                        });
                    }}
                >
                    New from Opened tabs
                </Button>
            </div>
            <div
                className="p-2 h-full overflow-hidden overflow-y-auto"
                ref={ref}
                onScroll={(e) => {
                    setScrollPos(e.currentTarget.scrollTop);
                }}
            >
                <Reorder.Group
                    axis="y"
                    layoutScroll
                    values={collectionOrder}
                    // todo impl real order
                    onReorder={(e) => {
                        setCollectionOrder(e);
                    }}
                    className="p-1 flex flex-col gap-2"
                >
                    {collectionData.length <= 0 ? (
                        <p>No Collections</p>
                    ) : (
                        collectionOrder.map((e) => (
                            <Collection
                                key={e.id}
                                item={e}
                                onDragEnd={() =>
                                    operations.changeCollectionOrder(
                                        collectionOrder.map((e) => e.id)
                                    )
                                }
                            />
                        ))
                    )}
                </Reorder.Group>
            </div>
        </div>
    );
};

export default CollectionView;
