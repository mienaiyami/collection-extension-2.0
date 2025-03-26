import { useAppContext } from "@/features/layout/App";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Pin, PinOff, X, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SyncStatus } from "@/features/layout/SyncStatus";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import Settings from "@/features/settings/Settings";

const TopBar = () => {
    const { inCollectionView, openCollection } = useAppContext();
    const { collectionData } = useAppContext();
    const [title, setTitle] = useState("");
    const [first, setFirst] = useState(true);
    const operations = useCollectionOperations();

    useLayoutEffect(() => {
        if (inCollectionView) {
            const current = collectionData.find((e) => e.id === inCollectionView);
            if (current) {
                setTitle(current.title);
            }
        }
    }, [inCollectionView, collectionData]);

    useLayoutEffect(() => {
        setFirst(true);
    }, [inCollectionView]);

    useEffect(() => {
        if (first) setFirst(false);
    }, [first]);

    useEffect(() => {
        if (first) return;
        const timeout = setTimeout(() => {
            const found = collectionData.find((e) => e.id === inCollectionView);
            if (!found || found.title === title) return;
            if (inCollectionView) operations.renameCollection(inCollectionView, title);
        }, 2000);
        return () => {
            clearTimeout(timeout);
        };
    }, [title, collectionData, inCollectionView, operations, first]);

    return (
        <Dialog>
            <div className="p-3 flex flex-row gap-2 items-center w-full border-b">
                <TooltipProvider delayDuration={100} disableHoverableContent>
                    {inCollectionView ? (
                        <>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                className="shrink-0"
                                onClick={() => {
                                    openCollection(null);
                                }}
                            >
                                <ChevronLeft />
                            </Button>
                            <Input
                                value={title}
                                className="text-lg"
                                onKeyDown={(e) => {
                                    if (!["Escape"].includes(e.key)) {
                                        e.stopPropagation();
                                    }
                                    if (e.key === "Enter") {
                                        operations.renameCollection(inCollectionView, title);
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.currentTarget?.value;
                                    if (value) setTitle(value);
                                }}
                            />
                        </>
                    ) : (
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                window.browser.tabs.create({
                                    url: window.location.href,
                                });
                            }}
                            className="text-3xl font-bold tracking-tight"
                        >
                            Collections
                        </Button>
                    )}
                    <div className="ml-auto flex flex-row gap-1 items-center">
                        <SyncStatus />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button variant={"ghost"} size={"icon"}>
                                        <SettingsIcon />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Settings</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    style={{
                                        display: chrome.sidePanel
                                            ? "flex"
                                            : // checking only when firefox
                                            window.isSidePanel
                                            ? "none"
                                            : "flex",
                                    }}
                                    onClick={async () => {
                                        if (window.isSidePanel) {
                                            // note to self, `chrome.sidePanel` is not on `window.browser`, and only available on chromium
                                            if (chrome.sidePanel) {
                                                chrome.sidePanel.setPanelBehavior({
                                                    openPanelOnActionClick: false,
                                                });
                                                window.close();
                                            } else {
                                                window.browser.sidebarAction.close();
                                            }
                                            return;
                                        }
                                        if (chrome.sidePanel) {
                                            const windowId = (
                                                await window.browser.windows.getCurrent()
                                            ).id;
                                            //eslint-disable-next-line
                                            //@ts-ignore
                                            chrome.sidePanel.open({ windowId });
                                            chrome.sidePanel.setPanelBehavior({
                                                openPanelOnActionClick: true,
                                            });
                                        } else {
                                            window.browser.sidebarAction.open();
                                            window.close();
                                        }
                                    }}
                                >
                                    {window.isSidePanel ? <PinOff /> : <Pin />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle Sidebar</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={"ghost"}
                                    size={"icon"}
                                    onClick={() => {
                                        window.close();
                                        window.browser.sidebarAction.close();
                                    }}
                                >
                                    <X />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Close</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
            <Settings />
        </Dialog>
    );
};

export default TopBar;
