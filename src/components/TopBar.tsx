import { useAppContext } from "@/App";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { useTheme } from "@/hooks/theme-provider";
import { useAppSetting } from "@/hooks/appSetting-provider";
import {
    ChevronLeft,
    Info,
    Moon,
    Pin,
    PinOff,
    Settings,
    Sun,
    X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
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
import { Label } from "./ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { initAppSetting } from "@/utils";

const TopBar = () => {
    const {
        inCollectionView,
        openCollection,
        renameCollection,
        exportData,
        importData,
        restoreBackup,
    } = useAppContext();
    const { theme, setTheme } = useTheme();
    const { collectionData } = useAppContext();
    const { appSetting, setAppSetting } = useAppSetting();
    const [title, setTitle] = useState("");
    const [first, setFirst] = useState(true);
    const [lastBackup, setLastBackup] = useState("");

    const [copyDataFormat, setCopyDataFormat] = useState({
        value: appSetting.copyDataFormat,
        timeout: null as NodeJS.Timeout | null,
    });
    useLayoutEffect(() => {
        if (copyDataFormat.timeout) clearTimeout(copyDataFormat.timeout);
        setCopyDataFormat({ value: appSetting.copyDataFormat, timeout: null });
    }, [appSetting.copyDataFormat]);
    useLayoutEffect(() => {
        if (inCollectionView) {
            const current = collectionData.find(
                (e) => e.id === inCollectionView
            );
            if (current) {
                setTitle(current.title);
            }
        }
    }, [inCollectionView, collectionData]);

    useLayoutEffect(() => {
        setFirst(true);
    }, [inCollectionView]);

    useLayoutEffect(() => {
        if (!import.meta.env.DEV) {
            window.browser.storage.local
                .get("lastBackup")
                .then(({ lastBackup }) => {
                    if (lastBackup)
                        setLastBackup(
                            new Date(lastBackup as string).toString()
                        );
                    else setLastBackup("Not found");
                });
        }
    }, []);

    useEffect(() => {
        if (first) setFirst(false);
    }, [first]);

    useLayoutEffect(() => {
        if (first) return;
        const timeout = setTimeout(() => {
            if (
                collectionData.find((e) => e.id === inCollectionView)?.title ===
                title
            )
                return;
            if (inCollectionView) renameCollection(inCollectionView, title);
        }, 2000);
        return () => {
            clearTimeout(timeout);
        };
    }, [title]);

    return (
        <Dialog>
            <AlertDialog>
                <div className="p-3 flex flex-row gap-2 items-center w-full border-b">
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
                                        renameCollection(
                                            inCollectionView,
                                            title
                                        );
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.currentTarget.value;
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
                        <DialogTrigger asChild>
                            <Button variant={"ghost"} size={"icon"}>
                                <Settings />
                            </Button>
                        </DialogTrigger>

                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            title="Sidebar"
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
                    </div>
                </div>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Settings</DialogTitle>
                        <DialogDescription>
                            Note that it is not possible to sync collections
                            online because of quota limit, so you will lose them
                            if you delete profile or browser or logout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full overflow-auto max-h-[65vh] flex flex-col gap-2">
                        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
                            <span className="font-semibold">Theme</span>
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center ml-auto"
                                onClick={() => {
                                    if (theme === "dark") setTheme("light");
                                    else setTheme("dark");
                                }}
                            >
                                {theme === "dark" ? <Moon /> : <Sun />}{" "}
                                {theme === "dark" ? "Dark" : "Light"}
                            </Button>
                        </div>
                        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
                            <span className="font-semibold">Version</span>
                            <div className="flex flex-row gap-2 ml-auto">
                                {window.location.protocol ===
                                "chrome-extension:"
                                    ? window.browser.runtime.getManifest()
                                          .version
                                    : "dev"}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2 border rounded-md">
                            <div className="flex flex-col gap-2 items-start w-full">
                                <span className="font-semibold">
                                    Font Options
                                </span>
                                <div className="flex flex-col gap-2 px-4 py-2">
                                    <TooltipProvider>
                                        <Tooltip
                                            delayDuration={0}
                                            disableHoverableContent
                                        >
                                            <TooltipTrigger className="cursor-default">
                                                <Label className="flex flex-row items-center justify-start gap-2">
                                                    <span className="min-w-[6rem] text-left">
                                                        Font Size
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            appSetting.font.size
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                [
                                                                    "ArrowUp",
                                                                    "ArrowDown",
                                                                ].includes(
                                                                    e.key
                                                                )
                                                            )
                                                                return;
                                                            e.preventDefault();
                                                        }}
                                                        min={10}
                                                        max={30}
                                                        step={0.1}
                                                        onChange={(e) => {
                                                            setAppSetting(
                                                                (init) => {
                                                                    const newSetting =
                                                                        window.cloneJSON(
                                                                            init
                                                                        );
                                                                    let size =
                                                                        Number(
                                                                            e
                                                                                .currentTarget
                                                                                .value
                                                                        );
                                                                    if (
                                                                        size <
                                                                        10
                                                                    )
                                                                        size = 10;
                                                                    if (
                                                                        size >
                                                                        30
                                                                    )
                                                                        size = 30;
                                                                    newSetting.font.size =
                                                                        size;
                                                                    return newSetting;
                                                                }
                                                            );
                                                        }}
                                                        className="p-2 py-0.5"
                                                    />
                                                </Label>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-[16rem]">
                                                    You can use arrow up/down to
                                                    increase/decrease font size.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip
                                            delayDuration={0}
                                            disableHoverableContent
                                        >
                                            <TooltipTrigger className="cursor-default">
                                                <Label className="flex flex-row items-center justify-start gap-2">
                                                    <span className="min-w-[6rem] text-left">
                                                        Font Family
                                                    </span>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            appSetting.font
                                                                .family
                                                        }
                                                        onChange={(e) => {
                                                            setAppSetting(
                                                                (init) => {
                                                                    const newSetting =
                                                                        window.cloneJSON(
                                                                            init
                                                                        );
                                                                    newSetting.font.family =
                                                                        e.currentTarget.value;
                                                                    return newSetting;
                                                                }
                                                            );
                                                        }}
                                                        className="p-2 py-0.5"
                                                    />
                                                </Label>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-[16rem]">
                                                    Enter full name of a local
                                                    font, like "Inter", "Inter
                                                    Black".
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <div className="flex flex-row items-stretch gap-2">
                                        <Button
                                            variant={"outline"}
                                            onClick={() => {
                                                setAppSetting(initAppSetting);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2 border rounded-md">
                            <div className="flex flex-col gap-2 items-start w-full">
                                <span className="font-semibold">
                                    Copy Data Format
                                </span>
                                <div className="flex flex-col gap-2 px-2">
                                    <pre className="p-2 text-xs rounded-sm font-mono whitespace-break-spaces">
                                        Available variables:
                                        {`\n{{i}}, {{title}}, {{url}}, {{img}}, {{date}}, {{id}}`}
                                    </pre>
                                    <textarea
                                        className="p-2 text-sm rounded-md min-h-[2em] max-h-[5em] bg-foreground/5"
                                        spellCheck={false}
                                        value={copyDataFormat.value}
                                        onChange={(e) => {
                                            if (copyDataFormat.timeout)
                                                clearTimeout(
                                                    copyDataFormat.timeout
                                                );
                                            const value = e.currentTarget.value;
                                            setCopyDataFormat({
                                                value,
                                                timeout: setTimeout(() => {
                                                    setAppSetting((init) => {
                                                        const newSetting =
                                                            window.cloneJSON(
                                                                init
                                                            );
                                                        newSetting.copyDataFormat =
                                                            value;
                                                        return newSetting;
                                                    });
                                                }, 2000),
                                            });
                                        }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2 border rounded-md">
                            <div className="flex flex-row gap-2 items-center w-full">
                                <span className="font-semibold">Data</span>
                                <div className="flex flex-row gap-2 ml-auto">
                                    <Button
                                        variant={"outline"}
                                        className="flex flex-row gap-2 items-center"
                                        onClick={exportData}
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        variant={"outline"}
                                        className="flex flex-row gap-2 items-center"
                                        onClick={importData}
                                    >
                                        Import
                                    </Button>
                                </div>
                            </div>
                            {!window.navigator.userAgent.includes("Chrome") && (
                                <p className="text-xs">
                                    To import on non-chromium browsers, first go
                                    to{" "}
                                    <a
                                        className="cursor-pointer underline hover:opacity-80"
                                        onClick={() => {
                                            window.browser.tabs.create({
                                                url: window.location.href,
                                            });
                                        }}
                                    >
                                        Collections page
                                    </a>{" "}
                                    (not popup) or inside a{" "}
                                    <strong>Sidebar</strong> then click import
                                    in settings.
                                </p>
                            )}
                        </div>
                        <div className="flex flex-row flex-wrap items-center gap-2 p-2 border rounded-md">
                            <span className="font-semibold">Links</span>
                            <div className="flex flex-row gap-2 ml-auto flex-wrap">
                                <Button
                                    variant={"outline"}
                                    className="flex flex-row gap-2 items-center"
                                    onClick={() => {
                                        window.browser.tabs.create({
                                            url: "https://github.com/mienaiyami/collection-extension-2.0",
                                        });
                                    }}
                                >
                                    Homepage
                                </Button>
                                <Button
                                    variant={"outline"}
                                    className="flex flex-row gap-2 items-center"
                                    onClick={() => {
                                        window.browser.tabs.create({
                                            url: "https://github.com/mienaiyami/collection-extension-2.0#shortcut-keys",
                                        });
                                    }}
                                >
                                    Shortcuts
                                </Button>
                                <Button
                                    variant={"outline"}
                                    className="flex flex-row gap-2 items-center"
                                    onClick={() => {
                                        window.browser.tabs.create({
                                            url: "https://github.com/mienaiyami/collection-extension-2.0/blob/main/CHANGELOG.md",
                                        });
                                    }}
                                >
                                    Changelog
                                </Button>
                                <Button
                                    variant={"outline"}
                                    className="flex flex-row gap-2 items-center"
                                    onClick={() => {
                                        window.browser.tabs.create({
                                            url: "https://github.com/mienaiyami/collection-extension-2.0/issues",
                                        });
                                    }}
                                >
                                    Report Issue
                                </Button>
                            </div>
                        </div>{" "}
                        <div className="flex flex-col gap-2 p-2 border rounded-md">
                            <div className="flex flex-row items-center gap-2">
                                <span className="font-semibold">Backup</span>
                                <div className="flex flex-row gap-2 ml-auto">
                                    <Button
                                        variant={"outline"}
                                        className="flex flex-row gap-2 items-center"
                                        onClick={() => {
                                            window.browser.storage.local
                                                .set({
                                                    backup: collectionData,
                                                })
                                                .then(() => {
                                                    const date = new Date();
                                                    window.browser.storage.local.set(
                                                        {
                                                            lastBackup:
                                                                date.toJSON(),
                                                        }
                                                    );
                                                    setLastBackup(
                                                        date.toString()
                                                    );
                                                });
                                        }}
                                    >
                                        Backup Now
                                    </Button>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="flex flex-row gap-2 items-center"
                                            onClick={() => {}}
                                        >
                                            Restore
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                            </div>
                            <DialogDescription className="text-left">
                                Local backup is made every 6 hours (if browser
                                is open). Choose this option if some error
                                caused all collections to vanish. <br />
                                <code className="rounded-md bg-secondary">
                                    Last Backup : {lastBackup}
                                </code>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogContent>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore backup?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will remove all collections and restore
                            from backup.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={restoreBackup}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Restore Backup
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

export default TopBar;
