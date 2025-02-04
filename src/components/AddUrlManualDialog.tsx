import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "@/App";
import { DialogClose } from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
const AddUrlManualDialog = () => {
    const [selectedTab, setSelectedTab] = useState("direct");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const { inCollectionView } = useAppContext();
    const operations = useCollectionOperations();
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
                <TooltipContent side="bottom">Manually Add URLs</TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-sm sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Links</DialogTitle>
                </DialogHeader>
                <Tabs
                    defaultValue="direct"
                    onValueChange={(e) => {
                        setSelectedTab(e);
                    }}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="direct">Direct</TabsTrigger>
                        <TabsTrigger value="file">From File</TabsTrigger>
                    </TabsList>
                    <TabsContent tabIndex={-1} value="direct" className="flex flex-col gap-2">
                        <DialogDescription>
                            Enter URLs (new line separated) to add to collection. To add url with
                            title, follow the url with
                            <code className="bg-foreground/10 rounded-sm px-2 py-0.5">
                                {" "}
                                || title || imageURL
                            </code>
                            Make sure that the title should not contain "||".
                        </DialogDescription>
                        <textarea
                            className="w-full min-w-[4rem] h-32 p-2 rounded-md bg-foreground/10 max-h-[40vh] whitespace-nowrap font-mono"
                            placeholder="https://example.com || Example || https://image.url.png"
                            ref={(node) => {
                                inputRef.current = node;
                            }}
                        ></textarea>
                    </TabsContent>
                    <TabsContent tabIndex={-1} value="file" className="flex flex-col gap-2">
                        <DialogDescription>
                            Upload a file containing URLs to add to collection. To add url with
                            title, follow the url with
                            <code> | title | imageURL</code>. For example:{" "}
                            <code className="bg-foreground/10 px-2 py-0.5 rounded-lg">
                                https://example.com || Example || https://image.url.png
                            </code>
                            . Make sure that the title should not contain "||".
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
                                        const urls = str.split("\n").map((e) => e.trim());
                                        const items: CollectionItem[] = urls
                                            .map((e) => {
                                                const split = e.split("||");
                                                try {
                                                    const url = new URL(split[0].trim());
                                                    const title = split[1]?.trim() || url.hostname;
                                                    const img = split[2]
                                                        ? new URL(split[2]?.trim())
                                                        : "";
                                                    return {
                                                        id: crypto.randomUUID(),
                                                        title,
                                                        url: url.toString(),
                                                        img: img.toString(),
                                                        createdAt: Date.now(),
                                                        updatedAt: Date.now(),
                                                        orderUpdatedAt: Date.now(),
                                                    };
                                                } catch (e) {
                                                    toast.error(`Failed to parse: ${e}`);
                                                    return null;
                                                }
                                            })
                                            .filter((e) => e !== null);
                                        if (items.length === 0) return toast.error("No URLs found");
                                        if (inCollectionView) {
                                            operations.addToCollection(inCollectionView, items);
                                        }
                                    };
                                    if (inputRef.current) {
                                        if (selectedTab === "file") {
                                            const file = (inputRef.current as HTMLInputElement)
                                                .files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    if (typeof e.target?.result === "string")
                                                        parseUrls(e.target.result);
                                                    else {
                                                        toast.error("Failed to read file");
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        } else parseUrls(inputRef.current.value);
                                    }
                                } catch (e) {
                                    toast.error("Failed to add URLs");
                                    console.error(e);
                                }
                            }}
                        >
                            Add URLs
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddUrlManualDialog;
