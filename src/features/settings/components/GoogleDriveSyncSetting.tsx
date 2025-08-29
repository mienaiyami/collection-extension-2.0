import { useCallback, useEffect, useState } from "react";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
        <div className="flex flex-col gap-2 p-2 border rounded-md">
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
                                        className="w-8 h-8 rounded-full"
                                        draggable={false}
                                    />
                                    <span>{loggedInUser.displayName}</span>
                                </div>
                            </TooltipTrigger>
                        </Tooltip>
                    ) : error ? (
                        <div className="flex flex-row gap-1 items-center">
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => {
                                    checkUser();
                                }}
                            >
                                <RotateCcw />
                            </Button>
                            <span className="text-destructive border border-destructive rounded-sm p-2">
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
                    <p className="text-sm text-muted-foreground">
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
