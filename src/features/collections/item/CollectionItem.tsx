import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useAppContext } from "@/features/layout/App";
import { AppWindow, Check } from "lucide-react";
import { useRef, useState } from "react";

import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Reorder } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type PropType = CollectionItem & {
    changeSelected: (id: UUID, checked: boolean) => void;
    isSelected: boolean;
    anySelected: boolean;
    onShiftPlusClick: (id: UUID) => void;
    onDragEnd: () => void;
};
const CollectionItem = (props: PropType) => {
    const { inCollectionView } = useAppContext();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    const [imgLoaded, setImgLoaded] = useState(false);

    const draggingRef = useRef(false);

    return (
        <Reorder.Item
            value={props.id}
            whileDrag={{ backdropFilter: "blur(4px)" }}
            dragListener={!props.anySelected}
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
                    className={`urlItem grid h-24 w-full cursor-pointer grid-cols-[25%_65%_10%] items-center rounded-md border hover:bg-foreground/10 active:bg-foreground/20 data-[state=open]:bg-foreground/20 ${
                        props.isSelected ? "ring-2 ring-purple-700 dark:ring-purple-400" : ""
                    }`}
                    tabIndex={0}
                    data-url-id={props.id}
                    onMouseDown={(e) => {
                        if (e.button === 1) e.preventDefault();
                    }}
                    onMouseUp={(e) => {
                        if (e.button === 1) {
                            e.preventDefault();
                            window.browser.tabs.create({
                                url: props.url,
                                active: false,
                            });
                        }
                        if (e.button === 0) {
                            if (draggingRef.current) return;
                            try {
                                if (e.ctrlKey)
                                    window.browser.tabs.create({
                                        url: props.url,
                                        active: false,
                                    });
                                else
                                    window.browser.tabs.update({
                                        url: props.url,
                                    });
                            } catch {
                                console.error("Use as extension.");
                            }
                        }
                    }}
                    onKeyDown={(e) => {
                        if ([" ", "Enter"].includes(e.key)) {
                            e.preventDefault();
                            if (e.target instanceof HTMLElement)
                                window.browser.tabs.create({
                                    url: props.url,
                                    active: false,
                                });
                            return;
                        }
                        if (props.anySelected) return;
                        //todo take the formatter key approach from yomikiru
                        switch (e.code) {
                            case "Delete":
                                inCollectionView &&
                                    operations.removeFromCollection(inCollectionView, props.id);
                                break;
                            case "KeyC":
                                navigator.clipboard.writeText(props.url);
                                break;
                            case "KeyN":
                                if (e.shiftKey) {
                                    window.browser.windows.create({
                                        url: props.url,
                                        state: "maximized",
                                        incognito: true,
                                    });
                                    break;
                                }
                                window.browser.windows.create({
                                    url: props.url,
                                    state: "maximized",
                                });
                                break;
                            case "KeyT":
                                window.browser.tabs.create({
                                    url: props.url,
                                    active: false,
                                });
                                break;
                            default:
                                break;
                        }
                        // if (e.key === "Escape" && dragging) setDragging(null);
                    }}
                >
                    <div className="grid h-full w-full place-items-center overflow-hidden">
                        <AppWindow
                            className="h-full w-full p-3.5"
                            style={{
                                display: !imgLoaded ? "initial" : "none",
                            }}
                        />
                        <img
                            src={props.img}
                            alt={props.title}
                            className="max-h-24 w-max rounded-sm p-1"
                            draggable={false}
                            onLoad={(e) => {
                                setImgLoaded(true);
                                if (e.currentTarget.width <= 100 || e.currentTarget.height <= 100) {
                                    e.currentTarget.classList.add("p-3.5");
                                }
                                if (
                                    e.currentTarget.width <= 50 ||
                                    e.currentTarget.height <= 50 ||
                                    e.currentTarget.src.toLowerCase().includes(".ico") ||
                                    e.currentTarget.src.toLowerCase().includes(".svg")
                                )
                                    e.currentTarget.classList.add("p-6");
                            }}
                            style={{
                                display: imgLoaded ? "initial" : "none",
                            }}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                        <span className="truncate text-lg" title={props.title}>
                            {props.title}
                        </span>
                        <span className="truncate text-muted-foreground text-xs" title={props.url}>
                            {props.url}
                        </span>
                    </div>
                    <div className="grid h-full w-full cursor-default place-items-center">
                        <label
                            onMouseUp={(e) => {
                                e.stopPropagation();
                                // e.currentTarget.focus();
                            }}
                            onClick={(e) => {
                                if (window.shiftKeyHeld) {
                                    e.preventDefault();
                                    props.onShiftPlusClick(props.id);
                                }
                            }}
                            onKeyDown={(e) => {
                                if ([" ", "Enter"].includes(e.key)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.shiftKey) {
                                        props.onShiftPlusClick(props.id);
                                    } else e.currentTarget.click();
                                }
                            }}
                            tabIndex={0}
                            className={
                                "group flex h-full items-center justify-center focus:outline-none"
                            }
                        >
                            <div
                                className={`rounded-md border group-hover:border-foreground/20 ${
                                    props.isSelected ? "bg-purple-700 dark:bg-purple-400" : ""
                                } ring-white group-focus:ring-2`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={props.isSelected}
                                    onChange={(e) => {
                                        props.changeSelected(props.id, e.currentTarget.checked);
                                    }}
                                />
                                <Check
                                    className="text-white"
                                    style={{
                                        visibility: props.isSelected ? "visible" : "hidden",
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
                                window.browser.tabs.create({
                                    url: props.url,
                                    active: false,
                                });
                            })();
                        }}
                    >
                        {t("collections.openInNewTab")}
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                window.browser.windows.create({
                                    url: props.url,
                                    state: "maximized",
                                });
                            })();
                        }}
                    >
                        {t("collections.openInNewWindow")}
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                window.browser.windows
                                    .create({
                                        url: props.url,
                                        state: "maximized",
                                        incognito: true,
                                    })
                                    .catch((e) => {
                                        toast.error(e);
                                    });
                            })();
                        }}
                    >
                        {t("collections.openInIncognito")}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={() => {
                            (async () => {
                                navigator.clipboard.writeText(props.url);
                            })();
                        }}
                    >
                        {t("collections.copyUrls")}
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={() => {
                            inCollectionView &&
                                operations.removeFromCollection(inCollectionView, props.id);
                        }}
                        className="focus:bg-destructive focus:text-destructive-foreground"
                    >
                        {t("collections.deleteItem")}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </Reorder.Item>
    );
};

export default CollectionItem;
