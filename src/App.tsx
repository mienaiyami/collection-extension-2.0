import React, {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import CollectionView from "./components/CollectionView";
import TopBar from "./components/TopBar";
import { Toaster } from "@/components/ui/toaster";
import CollectionItemView from "./components/CollectionItemView";
import { useToast } from "./components/ui/use-toast";
import { ToastAction } from "./components/ui/toast";
import Browser from "webextension-polyfill";
import testData from "./testData";

/**
 // todo, use toast for console.error
*/

type AppContextType = {
    collectionData: Collection[];
    inCollectionView: UUID | null;
    openCollection: (uuid: UUID | null) => void;
    makeNewCollection: (title: string, items?: CollectionItem[]) => void;
    removeCollections: (id: UUID | UUID[]) => void;
    addToCollection: (
        collectionId: UUID,
        newItem: CollectionItem | CollectionItem[]
    ) => void;
    removeFromCollection: (collectionId: UUID, itemId: UUID | UUID[]) => void;
    toastError: (description: React.ReactNode) => void;
    renameCollection: (id: UUID, newName: string) => void;
    // changeCollectionOrder: (id: UUID, newIndex: number) => void;
    changeCollectionOrder: (newOrder: UUID[]) => void;
    changeCollectionItemOrder: (colID: UUID, newOrder: UUID[]) => void;
    exportData: () => Promise<void>;
    importData: () => Promise<void>;
    restoreBackup: () => Promise<void>;
    scrollPos: number;
    setScrollPos: React.Dispatch<React.SetStateAction<number>>;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("AppContextProvider not used.");
    return context;
};

const App = () => {
    const [collectionData, setCollectionData] = useState<Collection[]>([]);
    const [inCollectionView, setInCollectionView] = useState<UUID | null>(null);
    const [firstDone, setFirstDone] = useState(false);
    const [openColOnCreate, setOpenColOnCreate] = useState<null | UUID>(null);

    const [scrollPos, setScrollPos] = useState(0);

    const { toast } = useToast();
    const toastError = (description: React.ReactNode) => {
        console.error(description?.toString());
        toast({
            title: "Error",
            variant: "destructive",
            description,
        });
    };
    useLayoutEffect(() => {
        if (import.meta.env.DEV) {
            setCollectionData(testData);
        } else {
            window.browser.storage.local
                .get("collectionData")
                .then(({ collectionData: _collectionData }) => {
                    if (_collectionData === undefined) {
                        setCollectionData([]);
                        window.browser.storage.local.set({ collectionData });
                    } else setCollectionData(_collectionData as Collection[]);
                    setFirstDone(true);
                });

            const onStorageChangeListener = (changes: {
                [key: string]: Browser.Storage.StorageChange;
            }) => {
                const c = changes.collectionData;
                if (
                    c &&
                    !(
                        (c.newValue as Collection[]).length === 0 &&
                        (c.oldValue as Collection[]).length !== 0
                    )
                )
                    setCollectionData(c.newValue as Collection[]);
            };

            window.browser.storage.local.onChanged.addListener(
                onStorageChangeListener
            );
            return () => {
                window.browser.storage.local.onChanged.removeListener(
                    onStorageChangeListener
                );
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
        if (import.meta.env.DEV) {
            setCollectionData(testData);
        } else {
            //todo, maybe getting called 2x
            if (openColOnCreate) {
                openCollection(openColOnCreate);
                setOpenColOnCreate(null);
            }
            if (firstDone) window.browser.storage.local.set({ collectionData });
        }
    }, [collectionData, firstDone]);

    const openCollection = (uuid: UUID | null) => {
        if (uuid) {
            const index = collectionData.findIndex((e) => e.id === uuid);
            if (index >= 0) setInCollectionView(uuid);
            else
                console.error(
                    `openCollection: Collection with id ${uuid} not found.`
                );
        } else if (inCollectionView) {
            setInCollectionView(null);
        }
    };

    const exportData = async () => {
        const handle = await window.showSaveFilePicker({
            types: [
                {
                    accept: {
                        "application/json": [".json"],
                    },
                    description: "JSON File",
                },
            ],
            suggestedName: "collection_data",
        });
        const stream = await handle.createWritable();
        await stream.write(JSON.stringify(collectionData, null, "\t"));
        await stream.close();
    };

    //todo move all these to background.ts
    const importData = async () => {
        const handle = await window.showOpenFilePicker({
            types: [
                {
                    accept: {
                        "application/json": [".json"],
                    },
                    description: "JSON File",
                },
            ],
            multiple: false,
        });
        try {
            if (handle[0]) {
                const file = await handle[0].getFile();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const raw = reader.result;
                    const data = JSON.parse(raw as string) as Collection[];
                    /*
                     doing this because importing exported data get reversed, and its not good idea to `push`
                     instead of `unshift` in general coz it will make new items appear at the bottom of the list
                    */

                    data.reverse();
                    setCollectionData((init) => {
                        data.forEach((e) => {
                            const index = init.findIndex((a) => a.id === e.id);
                            if (index >= 0) {
                                const aa = init[index].items.map((e) => e.id);
                                e.items.forEach((c) => {
                                    if (!aa.includes(c.id)) {
                                        init[index].items.unshift(c);
                                    }
                                });
                            } else init.unshift(e);
                        });
                        toast({
                            title: "Imported Successfully",
                        });
                        return [...init];
                    });
                };
                reader.readAsText(file, "utf8");
            }
        } catch {
            toastError("Couldn't load file.");
        }
    };
    const restoreBackup = async () => {
        window.browser.storage.local.get("backup").then(({ backup }) => {
            if (backup) {
                window.browser.storage.local.set({ collectionData: backup });
                toast({
                    title: "Restored Backup",
                });
            }
        });
    };

    const makeNewCollection = (title: string, items: CollectionItem[] = []) => {
        const id = crypto.randomUUID();
        setCollectionData((init) => [
            {
                id,
                title,
                items,
                date: new Date().toISOString(),
            },
            ...init,
        ]);
        setOpenColOnCreate(id);
    };
    const removeCollections = (id: UUID | UUID[]) => {
        const init = [...collectionData];
        const remove = (_id: UUID) => {
            const index = collectionData.findIndex((e) => e.id === _id);
            if (index >= 0) {
                init.splice(index, 1);
            } else {
                toastError(
                    `removeCollections: Collection with id ${_id} not found.`
                );
            }
        };
        if (id instanceof Array) {
            id.forEach((_id) => {
                remove(_id);
            });
        } else {
            remove(id);
        }
        //todo, provide undo?
        setCollectionData(init);
    };

    const addToCollection = (
        collectionId: UUID,
        newItem: CollectionItem | CollectionItem[]
    ) => {
        const col = collectionData.findIndex((e) => e.id === collectionId);
        if (col >= 0) {
            setCollectionData((init) => {
                // init[col].items.unshift((newItem instanceof Array)?newItem:(...newItem));
                newItem instanceof Array
                    ? init[col].items.unshift(...newItem)
                    : init[col].items.unshift(newItem);
                return [...init];
            });
        } else {
            toastError(
                `addToCollection: Collection with id ${collectionId} not found.`
            );
        }
    };
    const removeFromCollection = (
        collectionId: UUID,
        itemId: UUID | UUID[]
    ) => {
        const collection = collectionData.find((e) => e.id === collectionId);
        if (collection) {
            const items = collection.items;
            const remove = (_id: UUID) => {
                const index = collection.items.findIndex((e) => e.id === _id);
                if (index >= 0) {
                    items.splice(index, 1);
                } else {
                    toastError(
                        `removeFromCollection: CollectionItem with id ${_id} not found.`
                    );
                }
            };
            if (itemId instanceof Array) {
                itemId.forEach((_id) => {
                    remove(_id);
                });
            } else {
                remove(itemId);
            }
            //todo, provide undo?
            setCollectionData((init) => {
                const dup = [...init];
                dup.find((e) => e.id === collectionId)!.items = items;
                return dup;
            });
        } else {
            toastError(
                `removeFromCollection: Collection with id ${collectionId} not found.`
            );
        }
    };

    // const changeCollectionOrder = (id: UUID, newIndex: number) => {
    //     const colIdx = collectionData.findIndex((e) => e.id === id);
    //     if (colIdx >= 0) {
    //         setCollectionData((init) => {
    //             const col = init.splice(colIdx, 1);
    //             init.splice(newIndex, 0, col[0]);
    //             return [...init];
    //         });
    //     } else toastError("Couldn't reorder.");
    // };
    const changeCollectionOrder = (newOrder: UUID[]) => {
        try {
            const newColItems = [...collectionData].sort(
                (a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
            );
            setCollectionData(newColItems);
        } catch {
            toastError("Couldn't reorder.");
        }
    };
    const changeCollectionItemOrder = (colID: UUID, newOrder: UUID[]) => {
        const colIdx = collectionData.findIndex((e) => e.id === colID);
        try {
            if (colIdx >= 0) {
                setCollectionData((init) => {
                    //todo test performance with v2.0.16;
                    const updatedColItems = [...init[colIdx].items].sort(
                        (a, b) =>
                            newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
                    );
                    init[colIdx].items = updatedColItems;
                    return [...init];
                });
            } else throw new Error();
        } catch {
            toastError("Couldn't reorder.");
        }
    };
    const renameCollection = (id: UUID, newName: string) => {
        const index = collectionData.findIndex((e) => e.id === id);
        if (index >= 0) {
            setCollectionData((init) => {
                const oldName = init[index].title;
                init[index].title = newName;
                toast({
                    title: "Renamed Collection",
                    description: `Collection "${oldName}" renamed to "${newName}".`,
                    style: {
                        bottom: 0,
                    },
                    action: (
                        <ToastAction
                            altText="Undo"
                            onClick={() => {
                                setCollectionData((init) => {
                                    init[index].title = oldName;
                                    return [...init];
                                });
                            }}
                        >
                            Undo
                        </ToastAction>
                    ),
                });
                return [...init];
            });
        } else
            toastError(`renameCollection: Collection with id ${id} not found.`);
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppContext.Provider
                value={{
                    collectionData,
                    inCollectionView,
                    addToCollection,
                    openCollection,
                    makeNewCollection,
                    removeCollections,
                    removeFromCollection,
                    toastError,
                    renameCollection,
                    changeCollectionOrder,
                    changeCollectionItemOrder,
                    exportData,
                    importData,
                    restoreBackup,
                    setScrollPos,
                    scrollPos,
                }}
            >
                <div className="w-full h-full border grid grid-rows-[65px_auto]">
                    <TopBar />
                    {inCollectionView ? (
                        <CollectionItemView />
                    ) : (
                        <CollectionView />
                    )}
                </div>
                <Toaster />
            </AppContext.Provider>
        </ThemeProvider>
    );
};

export default App;
