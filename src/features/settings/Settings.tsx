import GoogleDriveSync from "./components/GoogleDriveSyncSetting";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ThemeSetting from "./components/ThemeSetting";
import CopyDataFormatSetting from "./components/CopyDataFormatSetting";
import FontSettings from "./components/FontSettings";
import SettingsDangerZone from "./components/SettingsDangerZone";
import BackupSettings from "./components/BackupSettings";

const Settings: React.FC = () => {
    const operations = useCollectionOperations();

    return (
        <DialogContent className="max-w-sm sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl">Settings</DialogTitle>
            </DialogHeader>
            <div className="w-full overflow-auto max-h-[65vh] flex flex-col gap-2">
                <ThemeSetting />
                <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
                    <span className="font-semibold">Version</span>
                    <div className="flex flex-row gap-2 ml-auto">
                        {window.browser.runtime.getManifest().version}
                    </div>
                </div>
                <FontSettings />
                <CopyDataFormatSetting />
                <div className="flex flex-col gap-2 p-2 border rounded-md">
                    <div className="flex flex-row gap-2 items-center w-full">
                        <span className="font-semibold">Data</span>
                        <div className="flex flex-row gap-2 ml-auto">
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center"
                                onClick={operations.exportData}
                            >
                                Export
                            </Button>
                            <Button
                                variant={"outline"}
                                className="flex flex-row gap-2 items-center"
                                onClick={operations.importData}
                            >
                                Import
                            </Button>
                        </div>
                    </div>
                    {!window.navigator.userAgent.includes("Chrome") && (
                        <p className="text-xs">
                            To import on non-chromium browsers, first go to{" "}
                            <a
                                className="cursor-pointer underline hover:opacity-80"
                                onClick={() => {
                                    window.browser.tabs.create({
                                        url: window.location.href,
                                    });
                                }}
                            >
                                Collections page
                            </a>{" "}
                            (not popup) or inside a <strong>Sidebar</strong> then click import in
                            settings.
                        </p>
                    )}
                    <p>
                        <a
                            href="https://github.com/mienaiyami/collection-extension-2.0/wiki#how-to-properly-import-data-when-logged-in-with-google-drive-for-sync"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline hover:opacity-80"
                        >
                            Read this if you want to import while Google Drive Sync is enabled.
                        </a>
                    </p>
                </div>
                <GoogleDriveSync />
                <div className="flex flex-row flex-wrap items-center gap-2 p-2 border rounded-md">
                    <span className="font-semibold">Links</span>
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
                            Homepage
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
                            Shortcuts
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
                            Changelog
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
                            Report Issue
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
