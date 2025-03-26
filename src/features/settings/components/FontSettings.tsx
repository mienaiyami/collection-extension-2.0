import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { initAppSetting } from "@/utils";

const FontSettings = () => {
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md">
            <div className="flex flex-col gap-2 items-start w-full">
                <span className="font-semibold">Font Options</span>
                <div className="flex flex-col gap-2 px-4 py-2">
                    <TooltipProvider delayDuration={100} disableHoverableContent>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <Label className="flex flex-row items-center justify-start gap-2">
                                    <span className="min-w-[6rem] text-left">Font Size</span>
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
                                <p className="max-w-[16rem]">
                                    You can use arrow up/down to increase/decrease font size.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="cursor-default">
                                <Label className="flex flex-row items-center justify-start gap-2">
                                    <span className="min-w-[6rem] text-left">Font Family</span>
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
                                <p className="max-w-[16rem]">
                                    Enter full name of a local font, like "Inter", "Inter Black".
                                </p>
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
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FontSettings;
