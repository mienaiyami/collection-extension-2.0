import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Trans, useTranslation } from "react-i18next";
import BackupSettings from "./components/BackupSettings";
import CopyDataFormatSetting from "./components/CopyDataFormatSetting";
import FontSettings from "./components/FontSettings";
import GoogleDriveSync from "./components/GoogleDriveSyncSetting";
import LanguageSetting from "./components/LanguageSetting";
import SettingsDangerZone from "./components/SettingsDangerZone";
import ThemeSetting from "./components/ThemeSetting";

const Settings: React.FC = () => {
    const operations = useCollectionOperations();
    const { t } = useTranslation();

    return (
        <DialogContent className="max-w-sm sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl">{t("settings.title")}</DialogTitle>
            </DialogHeader>
            <div className="flex max-h-[65vh] w-full flex-col gap-2 overflow-auto">
                <ThemeSetting />
                <LanguageSetting />
                <div className="flex flex-row items-center gap-2 rounded-md border p-2">
                    <span className="font-semibold">{t("app.version")}</span>
                    <div className="ml-auto flex flex-row gap-2">
                        {window.browser.runtime.getManifest().version}
                    </div>
                </div>
                <FontSettings />
                <CopyDataFormatSetting />
                <div className="flex flex-col gap-2 rounded-md border p-2">
                    <div className="flex w-full flex-row items-center gap-2">
                        <span className="font-semibold">{t("settings.data")}</span>
                        <div className="ml-auto flex flex-row gap-2">
                            <Button
                                variant={"outline"}
                                className="flex flex-row items-center gap-2"
                                onClick={operations.exportData}
                            >
                                {t("common.export")}
                            </Button>
                            <Button
                                variant={"outline"}
                                className="flex flex-row items-center gap-2"
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
                                            role="button"
                                            tabIndex={0}
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
                <div className="flex flex-row flex-wrap items-center gap-2 rounded-md border p-2">
                    <span className="font-semibold">{t("settings.links")}</span>
                    <div className="ml-auto flex flex-row flex-wrap gap-2">
                        <Button
                            variant={"outline"}
                            className="flex flex-row items-center gap-2"
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
                            className="flex flex-row items-center gap-2"
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
                            className="flex flex-row items-center gap-2"
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
                            className="flex flex-row items-center gap-2"
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
