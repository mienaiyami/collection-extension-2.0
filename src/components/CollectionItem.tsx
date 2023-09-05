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

type PropType = CollectionItem;
const CollectionItem = (props: PropType) => {
    const { removeFromCollection, inCollectionView } = useAppContext();
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <ContextMenu>
            <ContextMenuTrigger
                className="w-full h-16 cursor-pointer p-2 gap-2 rounded-md grid grid-cols-[15%_70%_15%] hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 border"
                tabIndex={0}
                onClick={(e) => {
                    if (e.ctrlKey)
                        chrome.tabs.create({ url: props.url, active: false });
                    else chrome.tabs.update({ url: props.url });
                }}
                onMouseUp={(e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        chrome.tabs.create({ url: props.url, active: false });
                    }
                }}
            >
                {!imgLoaded ? (
                    <AppWindow className="w-full h-full p-2" />
                ) : (
                    <img
                        src={props.img}
                        className="w-full h-full p-2"
                        draggable={false}
                        onLoad={() => setImgLoaded(true)}
                    />
                )}
                <div className="flex flex-col item-center justify-center">
                    <span className="text-lg truncate">{props.title}</span>
                    <span className="text-xs text-muted-foreground truncate">
                        {props.url}
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
                                state: "normal",
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
                                state: "normal",
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
