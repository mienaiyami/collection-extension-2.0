import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const CHECK_USER_INTERVAL = 1000 * 60;

const GoogleDriveSync = () => {
    const [loggedInUser, setLoggedInUser] = useState<GoogleDriveUserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const operations = useCollectionOperations();
    const checkUser = useCallback(async () => {
        const res = await operations.getGoogleDriveUserInfo();
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
        console.log("called123123");
        const interval = setInterval(checkUser, CHECK_USER_INTERVAL);
        return () => clearInterval(interval);
    }, [loggedInUser, error]);

    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md">
            <TooltipProvider>
                <div className="flex flex-col items-start gap-2">
                    <span className="font-semibold">Google Drive Sync (Beta)</span>
                    {loggedInUser ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <span>Logged in as : </span>
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
                        <>
                            <Button size={"icon"} variant={"ghost"}>
                                <RotateCcw />
                            </Button>
                            <span className="text-destructive border border-destructive rounded-sm p-2">
                                {error}
                            </span>
                        </>
                    ) : (
                        <span>Not logged in</span>
                    )}
                    <div className="flex flex-col gap-2">
                        {loggedInUser ? (
                            <>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={async () => {
                                        setLoading(true);
                                        const response = await operations.googleDriveSyncNow();
                                        if (response.success) {
                                            toast.success("Synced successfully");
                                        }
                                        setLoading(false);
                                    }}
                                >
                                    Sync Now
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={loading}
                                    onClick={async () => {
                                        setLoading(true);
                                        await operations.logoutGoogleDrive();
                                        setLoggedInUser(null);
                                        setLoading(false);
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    const response = await operations.loginGoogleDrive();
                                    if (response.success) {
                                        const res = await operations.getGoogleDriveUserInfo();
                                        if (res.success) setLoggedInUser(res.data);
                                    }
                                    setLoading(false);
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Login with Google Drive"
                                )}
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Note:</span> This feature is in beta. Please
                        report any issues. <br />
                        Syncing may take 5-40MB of data per sync depending on your data size.
                    </p>
                </div>
            </TooltipProvider>
        </div>
    );
};

export default GoogleDriveSync;
