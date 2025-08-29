import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppContext } from "@/features/layout/App";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { DialogClose } from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const AddUrlManualDialog = () => {
    const [selectedTab, setSelectedTab] = useState("direct");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
        null
    );
    const { inCollectionView } = useAppContext();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            // title="Add urls manually"
                        >
                            {/* <file-pen-line></file-pen-line> */}
                            <Pencil />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    {t("tooltips.addUrls")}
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-sm sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("collections.addUrls")}</DialogTitle>
                </DialogHeader>
                <Tabs
                    defaultValue="direct"
                    onValueChange={(e) => {
                        setSelectedTab(e);
                    }}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="direct">
                            {t("collections.addDirect")}
                        </TabsTrigger>
                        <TabsTrigger value="file">
                            {t("collections.addFromFile")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        tabIndex={-1}
                        value="direct"
                        className="flex flex-col gap-2"
                    >
                        <DialogDescription>
                            {t("dialogs.addUrlsDescription")}
                            <code className="rounded-sm bg-foreground/10 px-2 py-0.5">
                                {" "}
                                || title || imageURL
                            </code>
                            {t("collections.titleNotContain")}
                        </DialogDescription>
                        <textarea
                            className="h-32 max-h-[40vh] w-full min-w-[4rem] whitespace-nowrap rounded-md bg-foreground/10 p-2 font-mono"
                            placeholder={t("dialogs.addUrlsPlaceholder")}
                            ref={(node) => {
                                inputRef.current = node;
                            }}
                        />
                    </TabsContent>
                    <TabsContent
                        tabIndex={-1}
                        value="file"
                        className="flex flex-col gap-2"
                    >
                        <DialogDescription>
                            {t("collections.uploadFile")}
                            <code> | title | imageURL</code>.{" "}
                            {t("collections.makeNewTitleExample")}{" "}
                            <code className="rounded-lg bg-foreground/10 px-2 py-0.5">
                                {t("dialogs.addUrlsPlaceholder")}
                            </code>
                            . {t("collections.titleNotContain")}
                        </DialogDescription>
                        <Input
                            type="file"
                            accept=".txt"
                            ref={(node) => {
                                inputRef.current = node;
                            }}
                        />
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={() => {
                                try {
                                    const parseUrls = (str: string) => {
                                        const urls = str
                                            .split("\n")
                                            .map((e) => e.trim());
                                        const items: CollectionItem[] = urls
                                            .map((e) => {
                                                const split = e.split("||");
                                                try {
                                                    const url = new URL(
                                                        split[0].trim()
                                                    );
                                                    const title =
                                                        split[1]?.trim() ||
                                                        url.hostname;
                                                    const img = split[2]
                                                        ? new URL(
                                                              split[2]?.trim()
                                                          )
                                                        : "";
                                                    return {
                                                        id: crypto.randomUUID(),
                                                        title,
                                                        url: url.toString(),
                                                        img: img.toString(),
                                                        createdAt: Date.now(),
                                                        updatedAt: Date.now(),
                                                        orderUpdatedAt:
                                                            Date.now(),
                                                    };
                                                } catch (e) {
                                                    toast.error(
                                                        t(
                                                            "messages.failedToParseFile",
                                                            {
                                                                error: e,
                                                            }
                                                        )
                                                    );
                                                    return null;
                                                }
                                            })
                                            .filter((e) => e !== null);
                                        if (items.length === 0)
                                            return toast.error(
                                                t("messages.noUrlsFound")
                                            );
                                        if (inCollectionView) {
                                            operations.addToCollection(
                                                inCollectionView,
                                                items
                                            );
                                        }
                                    };
                                    if (inputRef.current) {
                                        if (selectedTab === "file") {
                                            const file = (
                                                inputRef.current as HTMLInputElement
                                            ).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    if (
                                                        typeof e.target
                                                            ?.result ===
                                                        "string"
                                                    )
                                                        parseUrls(
                                                            e.target.result
                                                        );
                                                    else {
                                                        toast.error(
                                                            t(
                                                                "messages.failedToReadFile"
                                                            )
                                                        );
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        } else
                                            parseUrls(inputRef.current.value);
                                    }
                                } catch (e) {
                                    toast.error(t("messages.failedToAddUrls"));
                                    console.error(e);
                                }
                            }}
                        >
                            {t("collections.addUrlsButton")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddUrlManualDialog;
