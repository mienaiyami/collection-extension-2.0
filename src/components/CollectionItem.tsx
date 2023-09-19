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

type PropType = CollectionItem & {
    changeSelected: (id: UUID, checked: boolean) => void;
    isSelected: boolean;
    index: number;
};
const CollectionItem = (props: PropType) => {
    const {
        removeFromCollection,
        inCollectionView,
        changeCollectionItemOrder,
    } = useAppContext();
    const [imgLoaded, setImgLoaded] = useState(false);

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
                const x = elemRef.current.getBoundingClientRect().x,
                    y = e.clientY;
                setTimeout(() => {
                    const elem = document.elementFromPoint(x, y);
                    if (elem && inCollectionView) {
                        if (elem.classList.contains("urlItem")) {
                            const urlIndex = parseInt(
                                elem.getAttribute("data-url-index") || "-1"
                            );
                            if (urlIndex >= 0) {
                                changeCollectionItemOrder(
                                    inCollectionView,
                                    props.id,
                                    urlIndex
                                );
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
        <ContextMenu>
            <ContextMenuTrigger
                className={`urlItem w-full h-24 cursor-pointer rounded-md grid grid-cols-[25%_65%_10%] items-center hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border ${
                    props.isSelected
                        ? "ring-2 ring-purple-700 dark:ring-purple-400"
                        : ""
                } ${dragging ? "backdrop-blur-sm" : ""}`}
                tabIndex={0}
                data-url-id={props.id}
                data-url-index={props.index}
                ref={elemRef}
                onMouseDown={(e) => {
                    if (e.button === 1) e.preventDefault();
                }}
                onMouseUp={(e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        chrome.tabs.create({ url: props.url, active: false });
                    }
                    if (e.button === 0) {
                        if (dragging) return;
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
                    if (e.key === "Escape" && dragging) setDragging(null);
                }}
                draggable
                onDragStart={(e) => {
                    e.preventDefault();
                    setDragging({
                        initY: e.currentTarget.getBoundingClientRect().y,
                        height: e.currentTarget.getBoundingClientRect().height,
                    });
                }}
                onDragEnd={(e) => {
                    e.preventDefault();
                    setDragging(null);
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
                        className={`border rounded-md hover:border-foreground/20 ${
                            props.isSelected
                                ? "bg-purple-700 dark:bg-purple-400"
                                : ""
                        }`}
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
                            removeFromCollection(inCollectionView, props.id);
                    }}
                    className="focus:text-destructive-foreground focus:bg-destructive"
                >
                    Delete Item
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default CollectionItem;
