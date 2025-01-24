import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import { AppSettingProvider } from "@/hooks/appSetting-provider";
import CollectionView from "./components/CollectionView";
import TopBar from "./components/TopBar";
import CollectionItemView from "./components/CollectionItemView";
import Browser from "webextension-polyfill";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type AppContextType = {
    collectionData: Collection[];
    inCollectionView: UUID | null;
    openCollection: (uuid: UUID | null) => void;
    scrollPos: number;
    setScrollPos: React.Dispatch<React.SetStateAction<number>>;
    setOpenColOnCreate: React.Dispatch<React.SetStateAction<null | UUID>>;
};

const AppContext = createContext<AppContextType | null>(null);

//todo export to file;
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("AppContextProvider not used.");
    return context;
};

const App = () => {
    const [collectionData, setCollectionData] = useState<Collection[]>([]);
    const [inCollectionView, setInCollectionView] = useState<UUID | null>(null);
    const [openColOnCreate, setOpenColOnCreate] = useState<null | UUID>(null);

    const [scrollPos, setScrollPos] = useState(0);

    useLayoutEffect(() => {
        if (import.meta.env.DEV) {
            throw new Error("Removing DEV mode. 2025/01/23");
            // setCollectionData(testData);
        } else {
            window.browser.storage.local
                .get("collectionData")
                .then(({ collectionData: _collectionData }) => {
                    if (_collectionData === undefined) {
                        setCollectionData([]);
                        window.browser.storage.local.set({ collectionData });
                    } else setCollectionData(_collectionData as Collection[]);
                });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const replacer = (key: string, value: any) => {
                if (key === "") return value;
                if (Number.isInteger(Number(key))) return value;
                if (key === "id") return value;
                if (key === "title") return value;
                if (key === "items") {
                    let str = "";
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value.forEach((e: any) => {
                        str += e.id;
                    });
                    return str;
                }
            };
            const onStorageChangeListener = (changes: {
                [key: string]: Browser.Storage.StorageChange;
            }) => {
                const c = changes.collectionData;
                if (c) toast.dismiss();
                /*
                benchmark result on 38MB data for stringify
                1. without replacer: ~300ms
                2. replacer as  ["id", "title", "items"] : ~1.4ms
                3. replacer fn : 0.8ms
                */
                if (
                    c &&
                    !(
                        (c.newValue as Collection[]).length === 0 &&
                        (c.oldValue as Collection[]).length !== 0
                    ) &&
                    //! todo check for more optimization
                    // using ["id", "title", "items"]
                    JSON.stringify(c.newValue, replacer) !== JSON.stringify(c.oldValue, replacer)
                )
                    setCollectionData(c.newValue as Collection[]);
            };
            window.browser.storage.local.onChanged.addListener(onStorageChangeListener);
            return () => {
                window.browser.storage.local.onChanged.removeListener(onStorageChangeListener);
            };
        }
    }, []);

    useLayoutEffect(() => {
        const onShiftHeld = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (e.shiftKey) {
                window.shiftKeyHeld = true;
            }
        };
        const onShiftReleased = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                window.shiftKeyHeld = false;
            }
        };

        window.addEventListener("keydown", onShiftHeld);
        window.addEventListener("keyup", onShiftReleased);
        return () => {
            window.removeEventListener("keydown", onShiftHeld);
            window.removeEventListener("keyup", onShiftReleased);
        };
    }, []);

    useLayoutEffect(() => {
        // it is slow now compared to the previous version because
        // it have to wait for changes from background.ts
        if (openColOnCreate) {
            openCollection(openColOnCreate);
            setOpenColOnCreate(null);
        }
    }, [openColOnCreate]);

    const openCollection = (uuid: UUID | null) => {
        if (uuid) {
            const index = collectionData.findIndex((e) => e.id === uuid);
            if (index >= 0) setInCollectionView(uuid);
            else console.error(`openCollection: Collection with id ${uuid} not found.`);
        } else if (inCollectionView) {
            setInCollectionView(null);
        }
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppSettingProvider>
                <AppContext.Provider
                    value={{
                        collectionData,
                        inCollectionView,
                        openCollection,
                        setScrollPos,
                        scrollPos,
                        setOpenColOnCreate,
                    }}
                >
                    <div className="w-full h-full border grid grid-rows-[65px_auto]">
                        <TopBar />
                        {inCollectionView ? <CollectionItemView /> : <CollectionView />}
                    </div>
                    <Toaster richColors />
                </AppContext.Provider>
            </AppSettingProvider>
        </ThemeProvider>
    );
};

export default App;
