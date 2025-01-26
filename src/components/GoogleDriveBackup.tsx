import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { toast } from "sonner";

const GoogleDriveBackup = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const operations = useCollectionOperations();

    useEffect(() => {
        (async () => {
            const res = await operations.getGoogleDriveLoginStatus();
            if (res.success) setIsLoggedIn(res.data.isLoggedIn);
        })();
    }, []);

    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md">
            <div className="flex flex-row items-center gap-2">
                <span className="font-semibold">Google Drive Backup</span>
                <div className="flex flex-row gap-2 ml-auto">
                    {isLoggedIn ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    const response = await operations.uploadToGoogleDrive();
                                    if (response.success) {
                                        toast.success("Backup uploaded to Google Drive");
                                    }
                                }}
                            >
                                Upload to Drive
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    const response = await operations.downloadFromGoogleDrive();
                                    if (response.success) {
                                        toast.success("Backup restored from Google Drive");
                                    }
                                }}
                            >
                                Sync from Drive
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await operations.logoutGoogleDrive();
                                    setIsLoggedIn(false);
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                const response = await operations.loginGoogleDrive();
                                if (response.success) {
                                    setIsLoggedIn(true);
                                }
                            }}
                        >
                            Login with Google
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoogleDriveBackup;
