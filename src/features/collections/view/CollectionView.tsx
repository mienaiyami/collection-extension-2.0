import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/features/layout/App";
import Collection from "../item/Collection";
import { Reorder } from "framer-motion";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useTranslation } from "react-i18next";
// import { useVirtualizer } from "@tanstack/react-virtual";

const CollectionView = () => {
    const { collectionData, setScrollPos, scrollPos, setOpenColOnCreate } = useAppContext();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    const [collectionOrder, setCollectionOrder] = useState<
        { id: UUID; title: string; itemLen: number }[]
    >([]);
    // will not work with Reorder, need to implement separate mode for reorder and normal(with virtualizer)
    // const virtualizer = useVirtualizer({
    //     count: collectionData.length,
    //     getScrollElement: () => ref.current,
    //     estimateSize: () => 72,
    //     overscan: 1,
    // });
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
                        const response = await operations.makeNewCollection(
                            new Date().toLocaleString()
                        );
                        if (response.success) {
                            setOpenColOnCreate(response.data.collection.id);
                        }
                    }}
                >
                    {t("collections.newEmpty")}
                </Button>
                <Button
                    variant={"ghost"}
                    onClick={async () => {
                        operations.makeNewCollection(new Date().toLocaleString(), [], {
                            activeWindowId: (await window.browser.windows.getCurrent()).id,
                        });
                    }}
                >
                    {t("collections.newFromOpenedTabs")}
                </Button>
            </div>
            {collectionData.length === 0 ? (
                <div className="p-2 h-full overflow-hidden overflow-y-auto">
                    <p>{t("collections.noCollections")}</p>
                </div>
            ) : (
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
                        onReorder={(e) => {
                            setCollectionOrder(e);
                        }}
                        className="p-1 flex flex-col gap-2"
                    >
                        {collectionOrder.map((e) => (
                            <Collection
                                key={e.id}
                                item={e}
                                onDragEnd={() =>
                                    operations.changeCollectionOrder(
                                        collectionOrder.map((e) => e.id)
                                    )
                                }
                            />
                        ))}
                    </Reorder.Group>
                </div>
            )}
        </div>
    );
};

export default CollectionView;
