import { useState } from "react";
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

const SettingsDangerZone = () => {
    const [checked, setChecked] = useState(false);
    const [checked1, setChecked1] = useState(false);
    const operations = useCollectionOperations();
    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md border-destructive">
            <div className="flex flex-col items-start gap-2">
                <span className="font-semibold">Danger Zone</span>
                <AlertDialog
                    onOpenChange={() => {
                        setChecked(false);
                    }}
                >
                    <AlertDialogTrigger asChild>
                        <Button
                            variant={"destructive"}
                            className="flex flex-row gap-2 items-center"
                        >
                            Delete All Collection Data (local)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle> Delete All Collection Data (local)</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will remove all collections related data from your
                                browser only. This won't affect your data on the Google Drive, if
                                you have logged in and synced with Google Drive.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Label className="flex flex-row gap-1 items-center cursor-pointer">
                            <Checkbox
                                className="rounded-md"
                                checked={checked}
                                onCheckedChange={() => setChecked((init) => !init)}
                            />
                            I understand the consequences.
                        </Label>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!checked}
                                onClick={() => {
                                    if (checked) {
                                        operations.deleteAllLocalCollectionsData();
                                    }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
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
                            className="flex flex-row gap-2 items-center"
                        >
                            Delete All Sync Data (Google Drive Only)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Delete All Sync Data (Google Drive Only)
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will remove all collections related data from your
                                Google Drive only. This won't affect your data on the browser. If
                                you have other devices synced with the same Google Drive account,
                                the local data on those devices will need to be deleted manually.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Label className="flex flex-row gap-1 items-center cursor-pointer">
                            <Checkbox
                                className="rounded-md"
                                checked={checked1}
                                onCheckedChange={() => setChecked1((init) => !init)}
                            />
                            I understand the consequences.
                        </Label>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={!checked1}
                                onClick={() => {
                                    if (checked1) {
                                        operations.deleteAllGDriveSyncedCollectionData();
                                    }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default SettingsDangerZone;
