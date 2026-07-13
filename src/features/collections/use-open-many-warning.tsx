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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { shouldWarnBeforeOpenMany } from "./open-many";

type PendingOpen = {
    count: number;
    run: () => void;
};

/**
 * Gates bulk URL opens behind the shared AlertDialog when the count is large.
 * Renders {@link openManyWarningDialog} next to the view that triggers opens.
 */
export const useOpenManyWarning = () => {
    const { t } = useTranslation();
    const [pending, setPending] = useState<PendingOpen | null>(null);

    const requestOpenMany = (urls: string[], open: (urls: string[]) => void) => {
        if (urls.length === 0) return;
        if (!shouldWarnBeforeOpenMany(urls.length)) {
            open(urls);
            return;
        }
        setPending({
            count: urls.length,
            run: () => open(urls),
        });
    };

    const openManyWarningDialog = (
        <AlertDialog
            open={pending !== null}
            onOpenChange={(open) => {
                if (!open) setPending(null);
            }}
        >
            <AlertDialogContent
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("collections.openManyTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("collections.openManyWarning", { count: pending?.count ?? 0 })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            pending?.run();
                            setPending(null);
                        }}
                    >
                        {t("collections.openManyConfirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return { requestOpenMany, openManyWarningDialog };
};
