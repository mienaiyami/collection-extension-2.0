import { Cloud, CloudOff, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { toast } from "sonner";

const getIcon = (status: SyncState["status"] | undefined) => {
    switch (status) {
        case "synced":
            return <Cloud className="text-success" />;
        case "syncing":
            return <RefreshCw className="animate-spin text-blue-500" />;
        case "error":
            return <CloudOff className="text-destructive" />;
        case "unsynced":
            return <CloudOff className="text-yellow-500" />;
        default:
            return <HelpCircle className="text-gray-500" />;
    }
};

const getTooltipContent = (
    syncState: SyncState | null
): {
    message: string;
    details: string;
} => {
    if (syncState === null)
        return { message: "Sync status unknown", details: "Try logging in again." };
    const lastSyncedDetails = `Last synced: ${new Date(syncState.lastSynced!).toLocaleString()}`;
    switch (syncState.status) {
        case "synced":
            return {
                message: "Synced",
                details: lastSyncedDetails,
            };
        case "syncing":
            return {
                message: "Syncing",
                details: lastSyncedDetails,
            };
        case "unsynced":
            return {
                message: "Changes not synced",
                details: lastSyncedDetails,
            };
        case "error":
            return {
                message: "Error syncing",
                details: `Sync error: ${syncState.error}`,
            };
    }
};
export const SyncStatus = () => {
    const [syncState, setSyncState] = useState<SyncState | null>(null);
    const operations = useCollectionOperations();

    useEffect(() => {
        (async () => {
            const state = await operations.getGoogleDriveSyncState();
            if (state.success) setSyncState(state.data);
        })();
        const onStorageChangeListener = (changes: {
            [key: string]: Browser.Storage.StorageChange;
        }) => {
            if (changes.syncState && changes.syncState.newValue) {
                setSyncState(changes.syncState.newValue as SyncState);
            }
        };
        window.browser.storage.local.onChanged.addListener(onStorageChangeListener);
        return () => {
            window.browser.storage.local.onChanged.removeListener(onStorageChangeListener);
        };
    }, []);

    const tooltipContent = getTooltipContent(syncState);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                            const res = await operations.googleDriveSyncNow();
                            if (res.success) {
                                toast.success("Synced successfully");
                            }
                        }}
                        disabled={syncState === null || syncState.status === "syncing"}
                    >
                        {getIcon(syncState?.status)}
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center">
                <div className="flex flex-col items-start">
                    <span className="font-semibold">{tooltipContent.message}</span>
                    {tooltipContent.details && (
                        <span className="text-sm">{tooltipContent.details}</span>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
