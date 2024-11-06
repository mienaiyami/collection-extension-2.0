import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
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
import { getAllTabsData, getImgFromTab } from "@/utils";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
const CollectionItemView = () => {
    const {
        collectionData,
        inCollectionView,
        addToCollection,
        removeFromCollection,
        changeCollectionItemOrder,
        openCollection,
    } = useAppContext();

    const [selected, setSelected] = useState<UUID[]>([]);

    const [itemsOrder, setItemsOrder] = useState<UUID[]>([]);
    // will be used to as starting point when using shift+click
    const [lastChanged, setLastChanged] = useState<{
        id: UUID;
        type: "select" | "deselect";
    } | null>(null);
    const selected_deleteRef = useRef<HTMLButtonElement>(null);
    const selected_open = useRef<HTMLButtonElement>(null);
    const selected_openNewWindow = useRef<HTMLButtonElement>(null);
    const selected_openIncognito = useRef<HTMLButtonElement>(null);
    const selected_copy = useRef<HTMLButtonElement>(null);
    const currentCollection = useMemo(() => {
        if (inCollectionView) {
            return collectionData.find((e) => e.id === inCollectionView);
        }
    }, [collectionData, inCollectionView]);

    const changeSelected = (id: UUID, checked: boolean) => {
        setLastChanged({
            id,
            type: checked ? "select" : "deselect",
        });
        setSelected((init) => {
            if (!checked) {
                const index = init.findIndex((e) => e === id);
                if (index >= 0) init.splice(index, 1);
            } else init.push(id);
            return [...init];
        });
    };

    const onShiftPlusClick = useCallback(
        (onItem: UUID) => {
            // if(!currentCollection) {
            //     console.error("currentCollection is null");
            //     return;
            // }
            if (!lastChanged) return;
            const indexInMain = itemsOrder.findIndex((e) => e === onItem);
            const indexOfLastChanged = itemsOrder.findIndex(
                (e) => e === lastChanged.id
            );
            if (indexInMain === -1 || indexOfLastChanged === -1) return;
            const start = Math.min(indexInMain, indexOfLastChanged);
            const end = Math.max(indexInMain, indexOfLastChanged);
            // const selectedItems = itemsOrder.slice(start, end + 1);
            setSelected((init) => {
                const dup = [...init];
                if (lastChanged.type === "select") {
                    dup.push(...itemsOrder.slice(start, end + 1));
                } else {
                    for (let i = start; i <= end; i++) {
                        const index = dup.findIndex((e) => e === itemsOrder[i]);
                        if (index >= 0) dup.splice(index, 1);
                    }
                }
                return [...new Set(dup)];
            });
        },
        [itemsOrder, lastChanged]
    );

    useLayoutEffect(() => {
        setItemsOrder(currentCollection?.items.map((e) => e.id) || []);
    }, [currentCollection]);

    useLayoutEffect(() => {
        setSelected([]);
        const keyHandler = (e: KeyboardEvent) => {
            if (!currentCollection) return;
            switch (e.code) {
                case "Delete":
                    selected_deleteRef.current?.click();
                    break;
                case "KeyN":
                    {
                        if (e.shiftKey) selected_openIncognito.current?.click();
                        else selected_openNewWindow.current?.click();
                    }
                    break;
                case "KeyT":
                    selected_open.current?.click();
                    break;
                case "Escape":
                    setSelected([]);
                    break;
                case "KeyC":
                    selected_copy.current?.click();
                    break;
                case "KeyA":
                    if (e.ctrlKey)
                        setSelected(currentCollection.items.map((e) => e.id));
                    break;
                case "ArrowLeft":
                    if (e.altKey) openCollection(null);
                    break;
                default:
                    break;
            }
        };
        // only here till storage functions are moved to background.ts
        const onMessage = (message: unknown) => {
            if (!message) {
                console.error("onMessage: message is undefined.");
                return;
            }
            if (typeof message === "object" && "type" in message) {
                if (message.type === "add-current-tab-to-active-collection") {
                    if (inCollectionView)
                        return window.browser.tabs
                            .query({
                                currentWindow: true,
                                active: true,
                            })
                            .then((tabs) => {
                                const date = new Date();
                                if (tabs[0]) {
                                    getImgFromTab(tabs[0]).then((img) => {
                                        const item: CollectionItem = {
                                            date: date.toISOString(),
                                            id: crypto.randomUUID(),
                                            img,
                                            title: tabs[0].title || "title",
                                            url: tabs[0].url || "",
                                        };
                                        addToCollection(inCollectionView, item);
                                    });
                                }
                            });
                }
            } else {
                console.error(
                    "onMessage: message is of unknown type.",
                    message
                );
            }
        };
        window.addEventListener("keydown", keyHandler);
        window.browser.runtime.onMessage.addListener(onMessage);
        return () => {
            window.removeEventListener("keydown", keyHandler);
            window.browser.runtime.onMessage.removeListener(onMessage);
        };
    }, [
        collectionData,
        inCollectionView,
        currentCollection,
        openCollection,
        addToCollection,
    ]);

    return currentCollection ? (
        <AlertDialog>
            <div className="min-h-full grid grid-rows-[3rem_auto]">
                {selected.length === 0 && (
                    <div className="p-1 grid grid-cols-2 h-full items-center">
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                window.browser.tabs
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
                                getAllTabsData()
                                    .then((items) => {
                                        addToCollection(
                                            currentCollection.id,
                                            items
                                        );
                                    })
                                    .catch((e) => {
                                        toast.error(
                                            "Error while fetching tabs data",
                                            {
                                                description: e,
                                            }
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
                            ref={selected_open}
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
                                            window.browser.tabs.create({
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
                            ref={selected_openNewWindow}
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    window.browser.windows.create({
                                        url: items.map((e) => e.url),
                                        //todo check
                                        state: "normal",
                                    });
                            }}
                        >
                            New Window
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            ref={selected_openIncognito}
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    window.browser.windows
                                        .create({
                                            url: items.map((e) => e.url),
                                            state: "maximized",
                                            incognito: true,
                                        })
                                        .catch((e) => {
                                            toast.error("Error", {
                                                description: e,
                                            });
                                        });
                            }}
                        >
                            Incognito
                        </Button>
                        <Button
                            className="p-1"
                            variant={"ghost"}
                            size={"icon"}
                            ref={selected_copy}
                            title="Copy"
                            onClick={() => {
                                const items = collectionData
                                    .find((e) => e.id === inCollectionView)
                                    ?.items.filter((e) =>
                                        selected.includes(e.id)
                                    );
                                if (items)
                                    //todo add toast
                                    navigator.clipboard.writeText(
                                        items.map((e) => e.url).join("\n")
                                    );
                            }}
                        >
                            <Copy />
                        </Button>

                        <AlertDialogTrigger asChild ref={selected_deleteRef}>
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
                    <Reorder.Group
                        values={itemsOrder}
                        onReorder={(e) => setItemsOrder(e)}
                        className="p-3 flex flex-col gap-2"
                    >
                        {currentCollection.items.length <= 0 ? (
                            <p>No Items</p>
                        ) : (
                            currentCollection.items
                                .map((e, i) => (
                                    <CollectionItem
                                        {...e}
                                        key={e.id}
                                        changeSelected={changeSelected}
                                        isSelected={selected.includes(e.id)}
                                        anySelected={selected.length > 0}
                                        index={i}
                                        onShiftPlusClick={onShiftPlusClick}
                                        onDragEnd={() => {
                                            inCollectionView &&
                                                changeCollectionItemOrder(
                                                    inCollectionView,
                                                    itemsOrder
                                                );
                                        }}
                                    />
                                ))
                                .sort(
                                    (a, b) =>
                                        itemsOrder.indexOf(a.props.id) -
                                        itemsOrder.indexOf(b.props.id)
                                )
                        )}
                    </Reorder.Group>
                </div>
            </div>
            <AlertDialogContent
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
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
