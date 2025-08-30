import { useAppSetting } from "@/hooks/appSetting-provider";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { COPY_DATA_FORMAT } from "@/utils";
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CopyDataFormatSetting = () => {
    const { appSetting } = useAppSetting();
    const operations = useCollectionOperations();
    const { t } = useTranslation();
    const [copyDataFormat, setCopyDataFormat] = useState({
        value: appSetting.copyDataFormat,
        timeout: null as NodeJS.Timeout | null,
    });
    useLayoutEffect(() => {
        if (copyDataFormat.timeout) clearTimeout(copyDataFormat.timeout);
        setCopyDataFormat({ value: appSetting.copyDataFormat, timeout: null });
    }, [appSetting.copyDataFormat]);
    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <div className="flex w-full flex-col items-start gap-2">
                <span className="font-semibold">{t("settings.copyDataFormat")}</span>
                <div className="flex flex-col gap-2 px-2">
                    <pre className="whitespace-break-spaces rounded-sm p-2 font-mono text-xs">
                        {t("settings.availableVariables")}
                        {`\n${Object.keys(COPY_DATA_FORMAT).join(", ")}`}
                    </pre>
                    <textarea
                        className="max-h-[5em] min-h-[2em] rounded-md bg-foreground/5 p-2 text-sm"
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
                    />
                </div>
            </div>
        </div>
    );
};

export default CopyDataFormatSetting;
