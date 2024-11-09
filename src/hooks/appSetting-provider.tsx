import { initAppSetting } from "@/utils";
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";

type AppSettingProviderProps = {
    children: React.ReactNode;
};

type AppSettingProviderState = {
    appSetting: AppSettingType;
    setAppSetting: React.Dispatch<React.SetStateAction<AppSettingType>>;
};

const AppSettingContext = createContext<AppSettingProviderState | undefined>(
    undefined
);

export const useAppSetting = () => {
    const context = useContext(AppSettingContext);
    if (!context) {
        throw new Error(
            "useAppSetting must be used within a AppSettingProvider"
        );
    }
    return context;
};

export const AppSettingProvider = ({ children }: AppSettingProviderProps) => {
    const [appSetting, setAppSetting] =
        useState<AppSettingType>(initAppSetting);
    const [first, setFirst] = useState(false);

    useLayoutEffect(() => {
        if (!import.meta.env.DEV) {
            if (!first) {
                setFirst(true);
                window.browser.storage.local
                    .get()
                    .then(({ appSetting: _appSetting }) => {
                        if (
                            _appSetting &&
                            Object.keys(_appSetting).includes("version")
                        )
                            setAppSetting(_appSetting as AppSettingType);
                        else window.browser.storage.local.set({ appSetting });
                    });
            }
        }
    }, []);
    useLayoutEffect(() => {
        if (first) {
            window.browser.storage.local.set({ appSetting });
        }
    }, [appSetting, first]);
    useLayoutEffect(() => {
        const root = window.document.documentElement;
        root.style.setProperty("--font-size", `${appSetting.font.size}px`);
        root.style.setProperty("--font-family", `"${appSetting.font.family}"`);
    }, [appSetting.font]);

    const value = {
        appSetting,
        setAppSetting,
    };

    return (
        <AppSettingContext.Provider value={value}>
            {children}
        </AppSettingContext.Provider>
    );
};
