import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppContext } from "@/features/layout/App";
import { SyncStatus } from "@/features/layout/SyncStatus";
import Settings from "@/features/settings/Settings";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import {
    ChevronLeft,
    Pin,
    PinOff,
    Settings as SettingsIcon,
    X,
} from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const TopBar = () => {
    const { inCollectionView, openCollection, collectionData } =
        useAppContext();
    const [title, setTitle] = useState("");
    const [first, setFirst] = useState(true);
    const operations = useCollectionOperations();
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useLayoutEffect(() => {
        setFirst(true);
        if (inCollectionView) {
            const current = collectionData.find(
                (e) => e.id === inCollectionView
            );
            if (current) {
                setTitle(current.title);
            }
            if (inputRef.current) {
                if (current && current.createdAt > Date.now() - 1000 * 5)
                    inputRef.current.focus();
            }
        }
    }, [inCollectionView, collectionData]);

    useEffect(() => {
        if (first) setFirst(false);
    }, [first]);

    useEffect(() => {
        if (first) return;
        const timeout = setTimeout(() => {
            const found = collectionData.find((e) => e.id === inCollectionView);
            if (!found || found.title === title) return;
            if (title === "") {
                toast.error(t("messages.collectionNameEmpty"));
                return;
            }
            if (inCollectionView)
                operations.renameCollection(inCollectionView, title);
        }, 2000);
        return () => {
            clearTimeout(timeout);
        };
    }, [title, collectionData, inCollectionView, operations, first, t]);

    return (
        <Dialog>
            <div className="flex w-full flex-row items-center gap-2 border-b p-3">
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
                                ref={inputRef}
                                onKeyDown={(e) => {
                                    if (!["Escape"].includes(e.key)) {
                                        e.stopPropagation();
                                    }
                                    if (e.key === "Enter") {
                                        operations.renameCollection(
                                            inCollectionView,
                                            title
                                        );
                                    }
                                }}
                                onChange={(e) => {
                                    setTitle(e.currentTarget?.value ?? "");
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
                            className="font-bold text-3xl tracking-tight"
                        >
                            {t("app.title")}
                        </Button>
                    )}
                    <div className="ml-auto flex flex-row items-center gap-1">
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
                                <p>{t("tooltips.settings")}</p>
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
                                                chrome.sidePanel.setPanelBehavior(
                                                    {
                                                        openPanelOnActionClick:
                                                            false,
                                                    }
                                                );
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
                                <p>{t("tooltips.toggleSidebar")}</p>
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
                                <p>{t("tooltips.close")}</p>
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
