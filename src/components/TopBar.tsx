import { useAppContext } from "@/App";
import React, { useLayoutEffect, useRef } from "react";
import { Input } from "./ui/input";
import { useTheme } from "@/hooks/theme-provider";
import { ChevronLeft, ExternalLink, Github, Moon, Sun, X } from "lucide-react";
import { Button } from "./ui/button";

const TopBar = () => {
    const { inCollectionView, openCollection } = useAppContext();
    const { theme, setTheme } = useTheme();
    const { collectionData } = useAppContext();
    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (inCollectionView && inputRef.current) {
            const current = collectionData.find(
                (e) => e.id === inCollectionView
            );
            if (current) {
                inputRef.current.value = current.title;
            }
        }
    }, [inCollectionView, collectionData]);

    return (
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
                    <Input ref={inputRef} className="text-lg" />
                </>
            ) : (
                <h1 className="text-3xl font-bold tracking-tight ">
                    Collections
                </h1>
            )}
            <div className="ml-auto flex flex-row gap-1 items-center">
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                        if (theme === "dark") setTheme("light");
                        else setTheme("dark");
                    }}
                >
                    {theme === "dark" ? <Moon /> : <Sun />}
                </Button>
                {!inCollectionView && (
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => {
                            chrome.tabs.create({
                                url: "https://github.com/mienaiyami",
                            });
                        }}
                    >
                        <Github />
                    </Button>
                )}
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
                <Button variant={"ghost"} size={"icon"} onClick={window.close}>
                    <X />
                </Button>
            </div>
        </div>
    );
};

export default TopBar;
