import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Loader2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const CHECK_USER_INTERVAL = 1000 * 60;

const GoogleDriveSync = () => {
    const [loggedInUser, setLoggedInUser] = useState<GoogleDriveUserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const { getGoogleDriveUserInfo, googleDriveSyncNow, logoutGoogleDrive, loginGoogleDrive } =
        useCollectionOperations();
    const checkUser = useCallback(async () => {
        const res = await getGoogleDriveUserInfo();
        if (res.success) {
            setLoggedInUser(res.data);
            setError(null);
        } else {
            setLoggedInUser(null);
            setError(res.error);
        }
    }, []);
    useEffect(() => {
        checkUser();
    }, []);
    useEffect(() => {
        const interval = setInterval(checkUser, CHECK_USER_INTERVAL);
        return () => clearInterval(interval);
    }, [loggedInUser, error]);

    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <TooltipProvider>
                <div className="flex flex-col items-start gap-2">
                    <span className="font-semibold">{t("settings.googleDriveSyncBeta")}</span>
                    {loggedInUser ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <span>{t("settings.loggedInAs")} : </span>
                                    <TooltipContent>
                                        <p>{loggedInUser.email}</p>
                                    </TooltipContent>
                                    <img
                                        src={loggedInUser.imageUrl}
                                        alt="User"
                                        className="h-8 w-8 rounded-full"
                                        draggable={false}
                                    />
                                    <span>{loggedInUser.displayName}</span>
                                </div>
                            </TooltipTrigger>
                        </Tooltip>
                    ) : error ? (
                        <div className="flex flex-row items-center gap-1">
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => {
                                    checkUser();
                                }}
                            >
                                <RotateCcw />
                            </Button>
                            <span className="rounded-sm border border-destructive bg-destructive p-2 text-destructive-foreground">
                                {error}
                            </span>
                        </div>
                    ) : (
                        <span>{t("settings.notLoggedIn")}</span>
                    )}
                    <div className="flex flex-col gap-2">
                        {loggedInUser ? (
                            <>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={async () => {
                                        setLoading(true);
                                        const response = await googleDriveSyncNow();
                                        if (response.success) {
                                            toast.success(t("messages.syncedSuccessfully"));
                                        }
                                        setLoading(false);
                                    }}
                                >
                                    {t("settings.syncNow")}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={async () => {
                                        setLoading(true);
                                        await logoutGoogleDrive();
                                        setLoggedInUser(null);
                                        setLoading(false);
                                    }}
                                >
                                    {t("settings.logout")}
                                </Button>
                            </>
                        ) : (
                            Boolean(!error) && (
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={async () => {
                                        setLoading(true);
                                        const response = await loginGoogleDrive();
                                        if (response.success) {
                                            const res = await getGoogleDriveUserInfo();
                                            if (res.success) setLoggedInUser(res.data);
                                        }
                                        setLoading(false);
                                    }}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        t("settings.loginWithGoogleDrive")
                                    )}
                                </Button>
                            )
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        <span className="font-semibold">Note:</span>{" "}
                        {t("settings.googleDriveSyncNote")} <br />
                        {t("settings.googleDriveSyncDataUsage")}
                    </p>
                </div>
            </TooltipProvider>
        </div>
    );
};

export default GoogleDriveSync;
