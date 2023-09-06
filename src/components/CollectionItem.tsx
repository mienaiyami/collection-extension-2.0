import React, { useState } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "./ui/context-menu";
import { useAppContext } from "@/App";
import { AppWindow } from "lucide-react";

type PropType = CollectionItem & {
    toggleSelected: (id: UUID) => void;
    isSelected: boolean;
};
const CollectionItem = (props: PropType) => {
    const { removeFromCollection, inCollectionView } = useAppContext();
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <ContextMenu>
            <ContextMenuTrigger
                className={`w-full h-16 cursor-pointer rounded-md grid grid-cols-[15%_70%_15%] hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border ${
                    props.isSelected ? "ring-2 ring-purple-600" : ""
                }`}
                tabIndex={0}
                onClick={(e) => {
                    if (e.ctrlKey)
                        chrome.tabs.create({ url: props.url, active: false });
                    else chrome.tabs.update({ url: props.url });
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                }}
                onMouseUp={(e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        chrome.tabs.create({ url: props.url, active: false });
                    }
                }}
                onKeyDown={(e) => {
                    if ([" ", "Enter"].includes(e.key)) {
                        e.preventDefault();
                        e.currentTarget.click();
                    }
                }}
            >
                <AppWindow
                    className="w-full h-full p-3"
                    style={{
                        display: !imgLoaded ? "initial" : "none",
                    }}
                />
                <img
                    src={props.img}
                    className="w-full h-full p-3"
                    draggable={false}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                        display: imgLoaded ? "initial" : "none",
                    }}
                />
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
                <div className="grid place-items-center p-4 cursor-default">
                    <label
                        onClick={(e) => {
                            e.stopPropagation();
                            e.currentTarget.focus();
                        }}
                        onKeyDown={(e) => {
                            if ([" ", "Enter"].includes(e.key)) {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.click();
                            }
                        }}
                        tabIndex={0}
                        className="border rounded-md hover:border-foreground/20"
                    >
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={props.isSelected}
                            onChange={() => {
                                console.log("aaaaaaaa");
                                props.toggleSelected(props.id);
                            }}
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#FFFFFF"
                            className=""
                            style={{
                                visibility: props.isSelected
                                    ? "visible"
                                    : "hidden",
                            }}
                        >
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
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
                        //todo test
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
                        //todo test
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
                        //todo test
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
                        //todo test
                        (async () => {
                            navigator.clipboard.writeText(props.url);
                        })();
                    }}
                >
                    Copy URL
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        //todo test
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
