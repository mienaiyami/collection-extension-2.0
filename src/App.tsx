import React, {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import { AppSettingProvider } from "@/hooks/appSetting-provider";
import CollectionView from "./components/CollectionView";
import TopBar from "./components/TopBar";
import CollectionItemView from "./components/CollectionItemView";
import Browser from "webextension-polyfill";
import testData from "./testData";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

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

//todo export to file;
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
                    ) &&
                    //! todo : temp fix, need to find a better way to compare or move to background.ts
                    JSON.stringify(c.newValue) !== JSON.stringify(c.oldValue)
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
        //eslint-disable-next-line
        //@ts-ignore
        if (window.showOpenFilePicker) {
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
        } else {
            const data = JSON.stringify(collectionData, null, "\t");
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "collection_data.json";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    //todo move all these to background.ts
    const importData = async () => {
        const withFile = (file: File) => {
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
                    toast.success("Imported Successfully");
                    return [...init];
                });
            };
            reader.readAsText(file, "utf8");
        };
        //eslint-disable-next-line
        //@ts-ignore
        if (window.showOpenFilePicker) {
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
                    withFile(file);
                }
            } catch {
                toast.error("Couldn't load file.");
            }
        } else {
            try {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    withFile(file);
                };
                input.click();
            } catch (e) {
                toast.error("Couldn't load file.");
            }
        }
    };
    const restoreBackup = async () => {
        window.browser.storage.local.get("backup").then(({ backup }) => {
            if (backup) {
                window.browser.storage.local.set({ collectionData: backup });
                toast.success("Restored Backup");
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
        setCollectionData((init) => {
            const newCol = [...init];
            let colNames = "";
            const remove = (_id: UUID) => {
                const index = newCol.findIndex((e) => e.id === _id);
                if (index >= 0) {
                    colNames += `${newCol[index].title}, `;
                    newCol.splice(index, 1);
                } else {
                    toast.error(
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
            // this is required because more than 2 toast can be shown with actions at the same time
            toast.dismiss();
            toast.success("Removed Collection", {
                description: `[${colNames.slice(0, -2)}] removed.`,
                duration: 10000,
                //todo : undo totally restore the collection to old state, meaning thing updated after delete will be lost
                action: {
                    label: "Undo",
                    onClick: () => {
                        setCollectionData([...init]);
                    },
                },
            });
            return newCol;
        });
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
            toast.error(
                `addToCollection: Collection with id ${collectionId} not found.`
            );
        }
    };
    const removeFromCollection = (
        collectionId: UUID,
        itemId: UUID | UUID[]
    ) => {
        setCollectionData((init) => {
            // need this because splice is on deep
            const dup = JSON.parse(JSON.stringify(init)) as Collection[];
            const collection = dup.find((e) => e.id === collectionId);
            if (collection) {
                const items = collection.items;
                let count = 0;
                const remove = (_id: UUID) => {
                    const index = collection.items.findIndex(
                        (e) => e.id === _id
                    );
                    if (index >= 0) {
                        items.splice(index, 1);
                        count++;
                    } else {
                        toast.error(
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

                // this is required because more than 2 toast can be shown with actions at the same time
                toast.dismiss();
                toast.success("Removed from Collection", {
                    description: `Removed ${count} item(s) from collection.`,
                    duration: count > 10 ? 10000 : 5000,
                    action: {
                        label: "Undo",
                        onClick: () => {
                            setCollectionData(init);
                        },
                    },
                });
                return dup;
            } else {
                toast.error(
                    `removeFromCollection: Collection with id ${collectionId} not found.`
                );
                return init;
            }
        });
    };

    // const changeCollectionOrder = (id: UUID, newIndex: number) => {
    //     const colIdx = collectionData.findIndex((e) => e.id === id);
    //     if (colIdx >= 0) {
    //         setCollectionData((init) => {
    //             const col = init.splice(colIdx, 1);
    //             init.splice(newIndex, 0, col[0]);
    //             return [...init];
    //         });
    //     } else toast.error("Couldn't reorder.");
    // };
    const changeCollectionOrder = (newOrder: UUID[]) => {
        try {
            setCollectionData((init) => {
                init.sort(
                    (a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
                );
                return [...init];
            });
        } catch {
            toast.error("Couldn't reorder.");
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
            toast.error("Couldn't reorder.");
        }
    };
    const renameCollection = (id: UUID, newName: string) => {
        const index = collectionData.findIndex((e) => e.id === id);
        if (index >= 0) {
            setCollectionData((init) => {
                const oldName = init[index].title;
                init[index].title = newName;
                toast.success("Renamed Collection", {
                    description: `Collection "${oldName}" renamed to "${newName}".`,
                    duration: 5000,
                    action: {
                        label: "Undo",
                        onClick: () => {
                            setCollectionData((init) => {
                                init[index].title = oldName;
                                return [...init];
                            });
                        },
                    },
                });
                return [...init];
            });
        } else
            toast.error(
                `renameCollection: Collection with id ${id} not found.`
            );
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppSettingProvider>
                <AppContext.Provider
                    value={{
                        collectionData,
                        inCollectionView,
                        addToCollection,
                        openCollection,
                        makeNewCollection,
                        removeCollections,
                        removeFromCollection,
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
                    <Toaster richColors />
                </AppContext.Provider>
            </AppSettingProvider>
        </ThemeProvider>
    );
};

export default App;
