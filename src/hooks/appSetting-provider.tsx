import { initAppSetting, normalizeAppSetting } from "@/utils";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import type Browser from "webextension-polyfill";

type AppSettingProviderProps = {
    children: React.ReactNode;
};

type AppSettingProviderState = {
    appSetting: AppSettingType;
};

const AppSettingContext = createContext<AppSettingProviderState | undefined>(undefined);

export const useAppSetting = () => {
    const context = useContext(AppSettingContext);
    if (!context) {
        throw new Error("useAppSetting must be used within a AppSettingProvider");
    }
    return context;
};

export const AppSettingProvider = ({ children }: AppSettingProviderProps) => {
    const [appSetting, setAppSetting] = useState<AppSettingType>(initAppSetting);

    useLayoutEffect(() => {
        window.browser.storage.local.get().then(({ appSetting: _appSetting }) => {
            if (_appSetting && typeof _appSetting === "object" && "version" in _appSetting) {
                const { setting, persist } = normalizeAppSetting(_appSetting);
                setAppSetting(setting);
                /* One-shot heal so legacy blobs gain collectionListView / etc. */
                if (persist) {
                    void window.browser.storage.local.set({ appSetting: setting });
                }
            } else window.browser.storage.local.set({ appSetting });
        });
        const onStorageChangeListener = (changes: {
            [key: string]: Browser.Storage.StorageChange;
        }) => {
            if (changes.appSetting) {
                /* Normalize for UI only — do not write here (multi-context write storms). */
                const { setting } = normalizeAppSetting(changes.appSetting.newValue);
                setAppSetting((prev) =>
                    JSON.stringify(setting) !== JSON.stringify(prev) ? setting : prev
                );
            }
        };
        window.browser.storage.local.onChanged.addListener(onStorageChangeListener);
        return () => {
            window.browser.storage.local.onChanged.removeListener(onStorageChangeListener);
        };
    }, []);
    useLayoutEffect(() => {
        const root = window.document.documentElement;
        root.style.setProperty("--font-size", `${appSetting.font.size}px`);
        root.style.setProperty("--font-family", `"${appSetting.font.family}"`);
    }, [appSetting.font]);

    const value = {
        appSetting,
    };

    return <AppSettingContext.Provider value={value}>{children}</AppSettingContext.Provider>;
};
