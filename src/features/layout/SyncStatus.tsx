import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import type { TFunction } from "i18next";
import { Cloud, CloudOff, HelpCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type Browser from "webextension-polyfill";

const getIcon = (status: SyncState["status"] | undefined) => {
    switch (status) {
        case "synced":
            return <Cloud className="text-success" />;
        case "syncing":
            return <RefreshCw className="animate-spin text-blue-500" />;
        case "error":
        case "not-authenticated":
            return <CloudOff className="text-destructive" />;
        case "unsynced":
            return <CloudOff className="text-yellow-500" />;
        default:
            return <HelpCircle className="text-gray-500" />;
    }
};

type SyncTooltipContent = {
    message: string;
    details: string;
    /** Danger styling for local-only / not-logged-in warnings. */
    danger?: boolean;
};

/**
 * Builds SyncStatus tooltip copy from the current sync state.
 * Unauthenticated users get a local-data loss warning (danger).
 */
const getTooltipContent = (syncState: SyncState | null, t: TFunction): SyncTooltipContent => {
    if (syncState === null)
        return {
            message: t("sync.statusUnknown"),
            details: t("sync.tryLoggingInAgain"),
        };
    const lastSyncedDetails = t("sync.lastSynced", {
        time: new Date(syncState.lastSynced ?? 0).toLocaleString(),
    });
    switch (syncState.status) {
        case "synced":
            return {
                message: t("sync.synced"),
                details: lastSyncedDetails,
            };
        case "syncing":
            return {
                message: t("sync.syncing"),
                details: lastSyncedDetails,
            };
        case "unsynced":
            return {
                message: t("sync.changesNotSynced"),
                details: lastSyncedDetails,
            };
        case "error":
            return {
                message: t("sync.syncError"),
                details: `${t("sync.error")}: ${syncState.error}`,
            };
        case "not-authenticated":
            return {
                message: t("sync.notAuthenticated"),
                details: t("sync.localDataWarning"),
                danger: true,
            };
        default:
            return {
                message: t("sync.statusUnknown"),
                details: t("sync.tryLoggingInAgain"),
            };
    }
};
export const SyncStatus = () => {
    const [syncState, setSyncState] = useState<SyncState | null>(null);
    const operations = useCollectionOperations();
    const { t } = useTranslation();

    useEffect(() => {
        (async () => {
            const state = await operations.getGoogleDriveSyncState();
            if (state.success) setSyncState(state.data);
        })();
        const onStorageChangeListener = (changes: {
            [key: string]: Browser.Storage.StorageChange;
        }) => {
            if (changes.syncState?.newValue) {
                setSyncState(changes.syncState.newValue as SyncState);
            }
        };
        window.browser.storage.local.onChanged.addListener(onStorageChangeListener);
        return () => {
            window.browser.storage.local.onChanged.removeListener(onStorageChangeListener);
        };
    }, []);

    const tooltipContent = getTooltipContent(syncState, t);

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
                                toast.success(t("messages.syncedSuccessfully"));
                            }
                        }}
                        disabled={
                            syncState === null ||
                            syncState.status === "syncing" ||
                            syncState.status === "not-authenticated"
                        }
                    >
                        {getIcon(syncState?.status)}
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent
                className={
                    tooltipContent.danger
                        ? "max-w-xs border-destructive bg-destructive text-center text-destructive-foreground"
                        : "max-w-xs text-center"
                }
            >
                <div className="flex flex-col items-start gap-1 text-left">
                    <span className="font-semibold">{tooltipContent.message}</span>
                    {tooltipContent.details && (
                        <span className="text-sm opacity-95">{tooltipContent.details}</span>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
