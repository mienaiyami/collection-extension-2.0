import React, { useLayoutEffect, useRef, useState } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./ui/context-menu";
import { useAppContext } from "@/App";
import { AppWindow, Check } from "lucide-react";

import { Reorder, motion } from "framer-motion";

type PropType = CollectionItem & {
    changeSelected: (id: UUID, checked: boolean) => void;
    isSelected: boolean;
    index: number;
    onDragEnd: () => void;
};
const CollectionItem = (props: PropType) => {
    const { removeFromCollection, inCollectionView } = useAppContext();
    const [imgLoaded, setImgLoaded] = useState(false);

    const draggingRef = useRef(false);

    return (
        <Reorder.Item
            value={props.id}
            whileDrag={{ backdropFilter: "blur(4px)" }}
            onDragStart={() => {
                draggingRef.current = true;
            }}
            onDragEnd={() => {
                draggingRef.current = false;
                props.onDragEnd();
            }}
            transition={{ duration: 0.2 }}
        >
            <ContextMenu>
                <ContextMenuTrigger
                    className={`urlItem w-full h-24 cursor-pointer rounded-md grid grid-cols-[25%_65%_10%] items-center hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border ${
                        props.isSelected
                            ? "ring-2 ring-purple-700 dark:ring-purple-400"
                            : ""
                    }`}
                    tabIndex={0}
                    data-url-id={props.id}
                    data-url-index={props.index}
                    onMouseDown={(e) => {
                        if (e.button === 1) e.preventDefault();
                    }}
                    onMouseUp={(e) => {
                        if (e.button === 1) {
                            e.preventDefault();
                            chrome.tabs.create({
                                url: props.url,
                                active: false,
                            });
                        }
                        if (e.button === 0) {
                            if (draggingRef.current) return;
                            try {
                                if (e.ctrlKey)
                                    chrome.tabs.create({
                                        url: props.url,
                                        active: false,
                                    });
                                else chrome.tabs.update({ url: props.url });
                            } catch {
                                console.error("Use as extension.");
                            }
                        }
                    }}
                    onKeyDown={(e) => {
                        if ([" ", "Enter"].includes(e.key)) {
                            e.preventDefault();
                            if (e.target instanceof HTMLElement)
                                chrome.tabs.create({
                                    url: props.url,
                                    active: false,
                                });
                        }
                        //todo impl if needed
                        // if (e.key === "Escape" && dragging) setDragging(null);
                    }}
                >
                    <div className="w-full h-full p-1 overflow-hidden grid place-items-center">
                        <AppWindow
                            className="h-full w-full p-3.5"
                            style={{
                                display: !imgLoaded ? "initial" : "none",
                            }}
                        />
                        <img
                            src={props.img}
                            className="h-full w-auto object-cover rounded-sm"
                            draggable={false}
                            onLoad={(e) => {
                                setImgLoaded(true);
                                if (
                                    e.currentTarget.width <= 100 ||
                                    e.currentTarget.height <= 100
                                ) {
                                    e.currentTarget.classList.add("p-3.5");
                                }
                                if (
                                    e.currentTarget.width <= 50 ||
                                    e.currentTarget.height <= 50 ||
                                    e.currentTarget.src
                                        .toLowerCase()
                                        .includes(".ico") ||
                                    e.currentTarget.src
                                        .toLowerCase()
                                        .includes(".svg")
                                )
                                    e.currentTarget.classList.add("p-6");
                            }}
                            style={{
                                display: imgLoaded ? "initial" : "none",
                            }}
                        />
                    </div>
                    <div className="p-2 flex flex-col item-center justify-center">
                        <span className="text-lg truncate" title={props.title}>
                            {props.title}
                        </span>
                        <span
                            className="text-xs text-muted-foreground truncate"
                            title={props.url}
                        >
                            {props.url}
                        </span>
                    </div>
                    <div className="grid place-items-center w-full h-full cursor-default">
                        <label
                            onMouseUp={(e) => {
                                e.stopPropagation();
                                // e.currentTarget.focus();
                            }}
                            onKeyDown={(e) => {
                                if ([" ", "Enter"].includes(e.key)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.click();
                                }
                            }}
                            tabIndex={0}
                            className={`h-full flex justify-center items-center group focus:outline-none`}
                        >
                            <div
                                className={`border rounded-md group-hover:border-foreground/20 ${
                                    props.isSelected
                                        ? "bg-purple-700 dark:bg-purple-400"
                                        : ""
                                } group-focus:ring-2 ring-white`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={props.isSelected}
                                    onChange={(e) => {
                                        props.changeSelected(
                                            props.id,
                                            e.currentTarget.checked
                                        );
                                    }}
                                />
                                <Check
                                    className="text-white"
                                    style={{
                                        visibility: props.isSelected
                                            ? "visible"
                                            : "hidden",
                                    }}
                                />
                            </div>
                        </label>
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
                                chrome.tabs.create({
                                    url: props.url,
                                    active: false,
                                });
                            })();
                        }}
                    >
                        Open
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                chrome.windows.create({
                                    url: props.url,
                                    state: "maximized",
                                });
                            })();
                        }}
                    >
                        Open in New Window
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                chrome.windows.create({
                                    url: props.url,
                                    state: "maximized",
                                    incognito: true,
                                });
                            })();
                        }}
                    >
                        Open in Incognito Window
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                navigator.clipboard.writeText(props.url);
                            })();
                        }}
                    >
                        Copy URL
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            inCollectionView &&
                                removeFromCollection(
                                    inCollectionView,
                                    props.id
                                );
                        }}
                        className="focus:text-destructive-foreground focus:bg-destructive"
                    >
                        Delete Item
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </Reorder.Item>
    );
};

export default CollectionItem;
