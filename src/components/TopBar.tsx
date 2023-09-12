import { useAppContext } from "@/App";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { useTheme } from "@/hooks/theme-provider";
import {
    ChevronLeft,
    ExternalLink,
    Github,
    Moon,
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
    const [title, setTitle] = useState("");
    const [first, setFirst] = useState(true);
    const [lastBackup, setLastBackup] = useState("");

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
        if (!import.meta.env.DEV)
            chrome.storage.local.get("lastBackup").then(({ lastBackup }) => {
                if (lastBackup)
                    setLastBackup(new Date(lastBackup as string).toString());
                else setLastBackup("Not found");
            });
    }, []);

    useEffect(() => {
        if (first) setFirst(false);
    }, [first]);

    useLayoutEffect(() => {
        if (first) return;
        const timeout = setTimeout(() => {
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
                                onChange={(e) => {
                                    const value = e.currentTarget.value;
                                    if (value) setTitle(value);
                                }}
                            />
                        </>
                    ) : (
                        <h1 className="text-3xl font-bold tracking-tight ">
                            Collections
                        </h1>
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
                            onClick={() => {
                                chrome.tabs.create({
                                    url:
                                        "chrome-extension://" +
                                        chrome.runtime.id +
                                        "/index.html",
                                });
                            }}
                        >
                            <ExternalLink />
                        </Button>
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={window.close}
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
                                    ? chrome.runtime.getManifest().version
                                    : "dev"}
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
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
                        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
                            <span className="font-semibold">Links</span>
                            <div className="flex flex-row gap-2 ml-auto">
                                <Button
                                    variant={"outline"}
                                    className="flex flex-row gap-2 items-center"
                                    onClick={() => {
                                        chrome.tabs.create({
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
                                        chrome.tabs.create({
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
                                            chrome.storage.local
                                                .set({
                                                    backup: collectionData,
                                                })
                                                .then(() => {
                                                    const date = new Date();
                                                    chrome.storage.local.set({
                                                        lastBackup:
                                                            date.toJSON(),
                                                    });
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
                    </DialogHeader>
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
