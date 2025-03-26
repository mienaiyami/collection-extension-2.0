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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useEffect, useState } from "react";
const BackupSettings = () => {
    const operations = useCollectionOperations();
    const [lastBackup, setLastBackup] = useState("");
    useEffect(() => {
        if (!import.meta.env.DEV) {
            window.browser.storage.local.get("lastBackup").then(({ lastBackup }) => {
                if (lastBackup) setLastBackup(new Date(lastBackup as string).toString());
                else setLastBackup("Not found");
            });
        }
    }, []);
    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md">
            <AlertDialog>
                <div className="flex flex-row items-center gap-2">
                    <span className="font-semibold">Backup</span>
                    <div className="flex flex-row gap-2 ml-auto">
                        <Button
                            variant={"outline"}
                            className="flex flex-row gap-2 items-center"
                            onClick={async () => {
                                const res = await operations.createLocalBackup();
                                if (res.success) {
                                    setLastBackup(new Date(res.data.date || 0).toString());
                                }
                            }}
                        >
                            Backup Now
                        </Button>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center"
                            >
                                Restore
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                </div>
                <DialogDescription className="text-left">
                    Local backup is made every 6 hours (if browser is open). Choose this option if
                    some error caused all collections to disappear. <br /> <br />
                    NOTE: Not recommended to be used with Google Drive Sync.{" "}
                    <a
                        href="https://github.com/mienaiyami/collection-extension-2.0/wiki#how-to-properly-restore-local-backup-when-logged-in-with-google-drive-for-sync"
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:opacity-80 font-bold"
                    >
                        Read more
                    </a>
                    <br />
                    <br />
                    <code className="rounded-md bg-secondary">Last Backup : {lastBackup}</code>
                </DialogDescription>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore backup?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>Not recommended to be used with Google Drive Sync.</strong>{" "}
                            <br />
                            This action will remove all collections and restore from backup. But if
                            you have deleted any collection before syncing syncing with Google
                            Drive, it will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={operations.restoreBackup}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Restore Backup
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BackupSettings;
