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
import { useTranslation } from "react-i18next";
const BackupSettings = () => {
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    const [lastBackup, setLastBackup] = useState("");
    useEffect(() => {
        if (!import.meta.env.DEV) {
            window.browser.storage.local
                .get("lastBackup")
                .then(({ lastBackup }) => {
                    if (lastBackup)
                        setLastBackup(
                            new Date(lastBackup as string).toString()
                        );
                    else setLastBackup(t("settings.notFound"));
                });
        }
    }, [t]);
    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <AlertDialog>
                <div className="flex flex-row items-center gap-2">
                    <span className="font-semibold">
                        {t("settings.backup")}
                    </span>
                    <div className="ml-auto flex flex-row gap-2">
                        <Button
                            variant={"outline"}
                            className="flex flex-row items-center gap-2"
                            onClick={async () => {
                                const res =
                                    await operations.createLocalBackup();
                                if (res.success) {
                                    setLastBackup(
                                        new Date(res.data.date || 0).toString()
                                    );
                                }
                            }}
                        >
                            {t("settings.backupNow")}
                        </Button>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="flex flex-row items-center gap-2"
                            >
                                {t("settings.restore")}
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                </div>
                <DialogDescription className="text-left">
                    {t("settings.backupDescription")} <br /> <br />
                    {t("settings.backupNote")}{" "}
                    <a
                        href="https://github.com/mienaiyami/collection-extension-2.0/wiki#how-to-properly-restore-local-backup-when-logged-in-with-google-drive-for-sync"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline hover:opacity-80"
                    >
                        {t("settings.backupReadMore")}
                    </a>
                    <br />
                    <br />
                    <code className="rounded-md bg-secondary">
                        {t("settings.lastBackup")} : {lastBackup}
                    </code>
                </DialogDescription>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("settings.restoreBackupTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>
                                {t("settings.restoreBackupWarning")}
                            </strong>{" "}
                            <br />
                            {t("settings.restoreBackupDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("common.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={operations.restoreBackup}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("settings.restoreBackup")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BackupSettings;
