import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/features/layout/App";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type DedupeKeep, countDuplicatesToRemove } from "./dedupe";

type Step = "choose" | "confirm";

/**
 * Two-stage remove-duplicates flow: choose keep newest/oldest, then confirm counts.
 * Uses a single AlertDialog so Radix does not stack modal scroll/pointer locks.
 * Targets one or more collections; dedupe is always per-collection.
 */
export const useRemoveDuplicatesDialog = () => {
    const { t } = useTranslation();
    const { collectionData } = useAppContext();
    const operations = useCollectionOperations();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("choose");
    const [collectionIds, setCollectionIds] = useState<UUID[]>([]);
    const [keep, setKeep] = useState<DedupeKeep>("newest");
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const openTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (openTimeoutRef.current !== null) {
                window.clearTimeout(openTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Opens after the current event (and any DropdownMenu/ContextMenu dismiss)
     * so Radix can clear `pointer-events: none` on `body` before the dialog locks.
     */
    const openForCollections = (ids: UUID[]) => {
        if (ids.length === 0) return;
        if (openTimeoutRef.current !== null) {
            window.clearTimeout(openTimeoutRef.current);
        }
        openTimeoutRef.current = window.setTimeout(() => {
            openTimeoutRef.current = null;
            setCollectionIds(ids);
            setKeep("newest");
            setStep("choose");
            submittingRef.current = false;
            setSubmitting(false);
            setOpen(true);
        }, 0);
    };

    const preview = countDuplicatesToRemove(collectionData, collectionIds, keep);

    const onConfirm = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const response = await operations.removeCollectionDuplicates(collectionIds, keep);
            if (response.success) setOpen(false);
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    const removeDuplicatesDialog = (
        <AlertDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setOpen(false);
                    submittingRef.current = false;
                    setSubmitting(false);
                }
            }}
        >
            <AlertDialogContent
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
                {step === "confirm" ? (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("collections.removeDuplicatesConfirmTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {preview.removeCount === 0
                                    ? t("collections.removeDuplicatesNone")
                                    : t("collections.removeDuplicatesConfirmDescription", {
                                          count: preview.removeCount,
                                          collections: preview.affectedCollections,
                                          keep:
                                              keep === "newest"
                                                  ? t("collections.keepMostRecent")
                                                  : t("collections.keepOldest"),
                                      })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submitting}
                                onClick={() => setStep("choose")}
                            >
                                {t("common.back")}
                            </Button>
                            <AlertDialogCancel disabled={submitting}>
                                {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={preview.removeCount === 0 || submitting}
                                onClick={(e) => {
                                    // Keep dialog open until the op succeeds (toast on failure).
                                    e.preventDefault();
                                    void onConfirm();
                                }}
                            >
                                {t("collections.removeDuplicatesConfirm")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </>
                ) : (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("collections.removeDuplicatesTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("collections.removeDuplicatesChooseDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                type="button"
                                onClick={() => {
                                    setKeep("newest");
                                    setStep("confirm");
                                }}
                            >
                                {t("collections.keepMostRecent")}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setKeep("oldest");
                                    setStep("confirm");
                                }}
                            >
                                {t("collections.keepOldest")}
                            </Button>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        </AlertDialogFooter>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );

    return { openForCollections, removeDuplicatesDialog };
};
