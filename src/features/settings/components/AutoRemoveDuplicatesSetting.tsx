import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { useTranslation } from "react-i18next";

/** Settings toggle for auto-removing older same-URL rows when adding to a collection. */
const AutoRemoveDuplicatesSetting = () => {
    const { t } = useTranslation();
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();

    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <div className="flex w-full flex-row items-center gap-2">
                <Label htmlFor="auto-remove-dups" className="font-semibold">
                    {t("settings.autoRemoveDuplicateUrls")}
                </Label>
                <Switch
                    id="auto-remove-dups"
                    className="ml-auto"
                    checked={appSetting.autoRemoveDuplicateUrls}
                    onCheckedChange={(checked) => {
                        operations.setAppSetting({ autoRemoveDuplicateUrls: checked });
                    }}
                />
            </div>
            <p className="text-muted-foreground text-xs">
                {t("settings.autoRemoveDuplicateUrlsDescription")}
            </p>
        </div>
    );
};

export default AutoRemoveDuplicatesSetting;
