import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/App";
import Collection from "./Collection";
import { getAllTabsData } from "@/utils";
import { Reorder } from "framer-motion";
import { toast } from "sonner";

const CollectionView = () => {
    const {
        collectionData,
        makeNewCollection,
        setScrollPos,
        scrollPos,
        changeCollectionOrder,
    } = useAppContext();
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
                        getAllTabsData()
                            .then((items) => {
                                makeNewCollection(
                                    new Date().toLocaleString(),
                                    items
                                );
                            })
                            .catch((e) => {
                                toast.error("Error while fetching tabs data", {
                                    description: e,
                                });
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
                                onDragEnd={() => {
                                    //todo impl
                                    changeCollectionOrder(
                                        collectionOrder.map((e) => e.id)
                                    );
                                }}
                            />
                        ))
                    )}
                </Reorder.Group>
            </div>
        </div>
    );
};

export default CollectionView;
