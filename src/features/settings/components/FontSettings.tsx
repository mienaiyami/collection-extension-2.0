import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { initAppSetting } from "@/utils";
import { useTranslation } from "react-i18next";

const FontSettings = () => {
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <div className="flex w-full flex-col items-start gap-2">
                <span className="font-semibold">{t("settings.fontOptions")}</span>
                <div className="flex flex-col gap-2 px-4 py-2">
                    <TooltipProvider delayDuration={100} disableHoverableContent>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <Label className="flex flex-row items-center justify-start gap-2">
                                    <span className="min-w-[6rem] text-left">
                                        {t("settings.fontSize")}
                                    </span>
                                    <Input
                                        type="number"
                                        value={appSetting.font.size}
                                        onKeyDown={(e) => {
                                            const allowedKeys = [
                                                "ArrowUp",
                                                "ArrowDown",
                                                "Tab",
                                                "Control",
                                                "Shift",
                                                "Alt",
                                                "Escape",
                                            ];
                                            if (!allowedKeys.includes(e.key)) e.preventDefault();
                                        }}
                                        min={10}
                                        max={30}
                                        step={0.1}
                                        onChange={(e) => {
                                            if (!e.currentTarget) return;
                                            let size = Number(e.currentTarget.value);
                                            if (size < 10) size = 10;
                                            if (size > 30) size = 30;
                                            operations.setAppSetting({
                                                font: {
                                                    ...appSetting.font,
                                                    size,
                                                },
                                            });
                                        }}
                                        className="p-2 py-0.5"
                                    />
                                </Label>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[16rem]">{t("settings.fontSizeTooltip")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <Label className="flex flex-row items-center justify-start gap-2">
                                    <span className="min-w-[6rem] text-left">
                                        {t("settings.fontFamily")}
                                    </span>
                                    <Input
                                        type="text"
                                        value={appSetting.font.family}
                                        onChange={(e) => {
                                            if (!e.currentTarget) return;
                                            operations.setAppSetting({
                                                font: {
                                                    ...appSetting.font,
                                                    family: e.currentTarget.value,
                                                },
                                            });
                                        }}
                                        className="p-2 py-0.5"
                                    />
                                </Label>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[16rem]">{t("settings.fontFamilyTooltip")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="flex flex-row items-stretch gap-2">
                        <Button
                            variant={"outline"}
                            onClick={() => {
                                operations.setAppSetting(initAppSetting);
                            }}
                        >
                            {t("settings.resetFont")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FontSettings;
