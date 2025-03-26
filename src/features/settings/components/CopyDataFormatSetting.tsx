import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { COPY_DATA_FORMAT } from "@/utils";
import { useLayoutEffect, useState } from "react";

const CopyDataFormatSetting = () => {
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    const [copyDataFormat, setCopyDataFormat] = useState({
        value: appSetting.copyDataFormat,
        timeout: null as NodeJS.Timeout | null,
    });
    useLayoutEffect(() => {
        if (copyDataFormat.timeout) clearTimeout(copyDataFormat.timeout);
        setCopyDataFormat({ value: appSetting.copyDataFormat, timeout: null });
    }, [appSetting.copyDataFormat]);
    return (
        <div className="flex flex-col gap-2 p-2 border rounded-md">
            <div className="flex flex-col gap-2 items-start w-full">
                <span className="font-semibold">Copy Data Format</span>
                <div className="flex flex-col gap-2 px-2">
                    <pre className="p-2 text-xs rounded-sm font-mono whitespace-break-spaces">
                        Available variables:
                        {`\n${Object.keys(COPY_DATA_FORMAT).join(", ")}`}
                    </pre>
                    <textarea
                        className="p-2 text-sm rounded-md min-h-[2em] max-h-[5em] bg-foreground/5"
                        spellCheck={false}
                        value={copyDataFormat.value}
                        onChange={(e) => {
                            if (copyDataFormat.timeout) clearTimeout(copyDataFormat.timeout);
                            if (!e.currentTarget) return;
                            const value = e.currentTarget.value;
                            setCopyDataFormat({
                                value,
                                timeout: setTimeout(() => {
                                    operations.setAppSetting({
                                        copyDataFormat: value,
                                    });
                                }, 2000),
                            });
                        }}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default CopyDataFormatSetting;
