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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SettingsDangerZone = () => {
    const [checked, setChecked] = useState(false);
    const [checked1, setChecked1] = useState(false);
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-2 rounded-md border border-destructive p-2">
            <div className="flex flex-col items-start gap-2">
                <span className="font-semibold">{t("settings.dangerZone")}</span>
                <AlertDialog
                    onOpenChange={() => {
                        setChecked(false);
                    }}
                >
                    <AlertDialogTrigger asChild>
                        <Button
                            variant={"destructive"}
                            className="flex flex-row items-center gap-2"
                        >
                            {t("settings.deleteAllLocal")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("dialogs.deleteAllLocalTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("dialogs.deleteAllLocalDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Label className="flex cursor-pointer flex-row items-center gap-1">
                            <Checkbox
                                className="rounded-md"
                                checked={checked}
                                onCheckedChange={() => setChecked((init) => !init)}
                            />
                            {t("dialogs.understandConsequences")}
                        </Label>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!checked}
                                onClick={() => {
                                    if (checked) {
                                        operations.deleteAllLocalCollectionsData();
                                    }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {t("common.delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    onOpenChange={() => {
                        setChecked1(false);
                    }}
                >
                    <AlertDialogTrigger asChild>
                        <Button
                            variant={"destructive"}
                            className="flex flex-row items-center gap-2"
                        >
                            {t("settings.deleteAllGDriveButton")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("settings.deleteAllGDriveTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("settings.deleteAllGDriveDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Label className="flex cursor-pointer flex-row items-center gap-1">
                            <Checkbox
                                className="rounded-md"
                                checked={checked1}
                                onCheckedChange={() => setChecked1((init) => !init)}
                            />
                            {t("dialogs.understandConsequences")}
                        </Label>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!checked1}
                                onClick={() => {
                                    if (checked1) {
                                        operations.deleteAllGDriveSyncedCollectionData();
                                    }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {t("common.delete")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default SettingsDangerZone;
