import GoogleDriveSync from "./components/GoogleDriveSyncSetting";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ThemeSetting from "./components/ThemeSetting";
import CopyDataFormatSetting from "./components/CopyDataFormatSetting";
import FontSettings from "./components/FontSettings";
import SettingsDangerZone from "./components/SettingsDangerZone";
import BackupSettings from "./components/BackupSettings";
import LanguageSetting from "./components/LanguageSetting";
import { Trans, useTranslation } from "react-i18next";

const Settings: React.FC = () => {
    const operations = useCollectionOperations();
    const { t, i18n } = useTranslation();

    return (
        <DialogContent className="max-w-sm sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl">{t("settings.title")}</DialogTitle>
            </DialogHeader>
            <div className="w-full overflow-auto max-h-[65vh] flex flex-col gap-2">
                <ThemeSetting />
                <LanguageSetting />
                <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
                    <span className="font-semibold">{t("app.version")}</span>
                    <div className="flex flex-row gap-2 ml-auto">
                        {window.browser.runtime.getManifest().version}
                    </div>
                </div>
                <FontSettings />
                <CopyDataFormatSetting />
                <div className="flex flex-col gap-2 p-2 border rounded-md">
                    <div className="flex flex-row gap-2 items-center w-full">
                        <span className="font-semibold">{t("settings.data")}</span>
                        <div className="flex flex-row gap-2 ml-auto">
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center"
                                onClick={operations.exportData}
                            >
                                {t("common.export")}
                            </Button>
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center"
                                onClick={operations.importData}
                            >
                                {t("common.import")}
                            </Button>
                        </div>
                    </div>
                    {!window.navigator.userAgent.includes("Chrome") && (
                        <p className="text-xs">
                            <Trans
                                i18nKey="settings.importHelp"
                                components={{
                                    link: (
                                        <a
                                            className="cursor-pointer underline hover:opacity-80"
                                            onClick={() => {
                                                window.browser.tabs.create({
                                                    url: window.location.href,
                                                });
                                            }}
                                        />
                                    ),
                                    strong: <strong />,
                                }}
                            />
                        </p>
                    )}
                    <p>
                        <a
                            href="https://github.com/mienaiyami/collection-extension-2.0/wiki#how-to-properly-import-data-when-logged-in-with-google-drive-for-sync"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline hover:opacity-80"
                        >
                            {t("settings.importWithGDriveHelp")}
                        </a>
                    </p>
                </div>
                <GoogleDriveSync />
                <div className="flex flex-row flex-wrap items-center gap-2 p-2 border rounded-md">
                    <span className="font-semibold">{t("settings.links")}</span>
                    <div className="flex flex-row gap-2 ml-auto flex-wrap">
                        <Button
                            variant={"outline"}
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                                window.browser.tabs.create({
                                    url: "https://github.com/mienaiyami/collection-extension-2.0",
                                });
                            }}
                        >
                            {t("settings.homepage")}
                        </Button>
                        <Button
                            variant={"outline"}
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                                window.browser.tabs.create({
                                    url: "https://github.com/mienaiyami/collection-extension-2.0#shortcut-keys",
                                });
                            }}
                        >
                            {t("settings.shortcuts")}
                        </Button>
                        <Button
                            variant={"outline"}
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                                window.browser.tabs.create({
                                    url: "https://github.com/mienaiyami/collection-extension-2.0/blob/main/CHANGELOG.MD",
                                });
                            }}
                        >
                            {t("settings.changelog")}
                        </Button>
                        <Button
                            variant={"outline"}
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                                window.browser.tabs.create({
                                    url: "https://github.com/mienaiyami/collection-extension-2.0/issues",
                                });
                            }}
                        >
                            {t("settings.reportIssue")}
                        </Button>
                    </div>
                </div>
                <BackupSettings />
                <SettingsDangerZone />
            </div>
        </DialogContent>
    );
};
export default Settings;
