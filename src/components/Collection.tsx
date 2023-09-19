import React, { useLayoutEffect, useRef, useState } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./ui/context-menu";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useAppContext } from "@/App";
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
import { getImgFromTab } from "@/utils";

type PropType = {
    id: UUID;
    title: string;
    itemLen: number;
};

const Collection = (props: PropType) => {
    const {
        addToCollection,
        collectionData,
        removeCollections,
        openCollection,
        changeCollectionOrder,
    } = useAppContext();

    const [dragging, setDragging] = useState<null | {
        initY: number;
        height: number;
    }>(null);

    const elemRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const evMove = (e: MouseEvent) => {
            if (dragging && elemRef.current) {
                const s = elemRef.current.style;
                s.translate =
                    "0 " +
                    (e.clientY - dragging.initY - dragging.height / 2 + "px");
            }
        };
        const evUp = (e: MouseEvent) => {
            if (elemRef.current) {
                setDragging(null);
                const x = elemRef.current.getBoundingClientRect().x + 1,
                    y = e.clientY;
                setTimeout(() => {
                    const elem = document.elementFromPoint(x, y);
                    if (elem) {
                        if (
                            elem.tagName === "BUTTON" &&
                            elem.parentElement!.classList.contains("collection")
                        ) {
                            const elem2 = elem.parentElement;
                            if (elem2) {
                                const collectionId =
                                    elem2.getAttribute("data-collection-id");
                                if (collectionId) {
                                    const index = collectionData.findIndex(
                                        (e) => e.id === collectionId
                                    );
                                    if (index >= 0) {
                                        changeCollectionOrder(props.id, index);
                                    }
                                }
                            }
                        }
                    }
                }, 0);
            }
        };
        const evLeave = () => {
            setDragging(null);
        };
        if (elemRef.current) {
            if (dragging === null) {
                elemRef.current.style.translate = "";
            } else {
                window.addEventListener("mousemove", evMove);
                window.addEventListener("mouseup", evUp);
                window.addEventListener("mouseleave", evLeave);
                return () => {
                    window.removeEventListener("mousemove", evMove);
                    window.removeEventListener("mouseup", evUp);
                    window.removeEventListener("mouseleave", evLeave);
                };
            }
        }
    }, [dragging]);

    return (
        <AlertDialog>
            <ContextMenu>
                <ContextMenuTrigger
                    className={`collection handle w-full h-16 rounded-md grid grid-cols-[15%_70%_15%] hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border ${
                        dragging ? "backdrop-blur-sm" : ""
                    }`}
                    data-collection-id={props.id}
                    tabIndex={0}
                    ref={elemRef}
                    draggable
                    onDragStart={(e) => {
                        e.preventDefault();
                        setDragging({
                            initY: e.currentTarget.getBoundingClientRect().y,
                            height: e.currentTarget.getBoundingClientRect()
                                .height,
                        });
                    }}
                    onKeyDown={(e) => {
                        if ([" ", "Enter"].includes(e.key)) {
                            e.preventDefault();
                            if (e.target instanceof HTMLElement)
                                openCollection(props.id);
                        }
                        if (e.key === "Escape" && dragging) setDragging(null);
                    }}
                    onMouseUp={(e) => {
                        if (e.button === 0) {
                            if (dragging) return;
                            openCollection(props.id);
                        }
                    }}
                    onDragEnd={(e) => {
                        e.preventDefault();
                        setDragging(null);
                    }}
                >
                    <Button
                        variant={"ghost"}
                        className="w-full h-full"
                        title="Add Current Tab"
                        onMouseUp={(e) => {
                            e.stopPropagation();
                        }}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            chrome.tabs
                                .query({
                                    active: true,
                                    currentWindow: true,
                                })
                                .then((tabs) => {
                                    const tab = tabs[0];
                                    getImgFromTab(tab).then((img) => {
                                        addToCollection(props.id, {
                                            //todo, mayabve move id to fn?
                                            id: crypto.randomUUID(),
                                            date: new Date().toISOString(),
                                            img,
                                            title: tab.title || "title",
                                            url: tab.url || "",
                                        });
                                    });
                                });
                        }}
                    >
                        <Plus />
                    </Button>
                    <div className="p-2 flex flex-col item-center justify-center">
                        <span className="text-lg truncate" title={props.title}>
                            {props.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {props.itemLen}{" "}
                            {props.itemLen > 1 ? "Items" : "Item"}
                        </span>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent
                    className="w-62"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        if (e.target instanceof HTMLElement) e.target.click();
                    }}
                >
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                const collection = collectionData.find(
                                    (e) => e.id === props.id
                                );
                                if (collection)
                                    for (
                                        let i = 0;
                                        i < collection.items.length;
                                        i++
                                    ) {
                                        const url = collection.items[i].url;
                                        if (url)
                                            chrome.tabs.create({
                                                url,
                                                active: false,
                                            });
                                    }
                            })();
                        }}
                    >
                        Open All
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                const collection = collectionData.find(
                                    (e) => e.id === props.id
                                );
                                if (collection) {
                                    const urls = collection.items.map(
                                        (e) => e.url
                                    );
                                    chrome.windows.create({
                                        url: urls,
                                        state: "maximized",
                                    });
                                }
                            })();
                        }}
                    >
                        Open All in New Window
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                const collection = collectionData.find(
                                    (e) => e.id === props.id
                                );
                                if (collection) {
                                    const urls = collection.items.map(
                                        (e) => e.url
                                    );
                                    chrome.windows.create({
                                        url: urls,
                                        state: "maximized",
                                        incognito: true,
                                    });
                                }
                            })();
                        }}
                    >
                        Open All in Incognito Window
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                const collection = collectionData.find(
                                    (e) => e.id === props.id
                                );
                                if (collection) {
                                    const data = collection.items
                                        .map((e) => e.url)
                                        .join("\n");
                                    navigator.clipboard.writeText(data);
                                }
                            })();
                        }}
                    >
                        Copy Data
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                        <AlertDialogTrigger asChild>
                            <ContextMenuItem className="focus:text-destructive-foreground focus:bg-destructive">
                                Delete Collection
                            </ContextMenuItem>
                        </AlertDialogTrigger>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the collection '{props.title}
                        '.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            removeCollections(props.id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default Collection;
