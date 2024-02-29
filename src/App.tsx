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
/**
 // todo, use toast for console.error
*/

const testData: Collection[] = [
    {
        id: "60d883a3-1af1-414f-8b10-a30885be4aa3",
        items: [
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "1d1ec1e7-8229-4668-a01d-049b9f029712",
                img: "https://web.whatsapp.com/img/favicon_c5088e888c97ad440a61d247596f88e5.png",
                title: "WhatsApp",
                url: "https://web.whatsapp.com/",
            },
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "a2aa8f95-32d9-4993-a4e4-2e5c4597f0e0",
                img: "https://doc.rust-lang.org/stable/book/favicon.svg",
                title: "Storing UTF-8 Encoded Text with Strings - The Rust Programming Language",
                url: "https://doc.rust-lang.org/stable/book/ch08-02-strings.html",
            },
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "1d74280d-e389-49d2-8b32-6a9b8ad9e615",
                img: "",
                title: "Collection",
                url: "http://localhost:5173/",
            },
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "57263c84-43a7-48a1-906a-8163a55f5a84",
                img: "https://ui.shadcn.com/favicon.ico",
                title: "Checkbox - shadcn/ui",
                url: "https://ui.shadcn.com/docs/components/checkbox",
            },
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "0bf57283-f037-40c3-918a-0dc6bdf2e5b1",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:43.359Z",
                id: "bedb44e8-a68e-4b6e-821c-d5e29bdfa9e5",
                img: "https://lucide.dev/favicon.ico",
                title: "Lucide | Lucide",
                url: "https://lucide.dev/icons/categories#charts",
            },
            {
                date: "2023-09-06T04:02:40.578Z",
                id: "1cf050a8-1e04-40c3-acf6-ea9987bd6d1a",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:40.475Z",
                id: "b9ca92f3-9fb8-4477-a069-dc8020bff05a",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:40.247Z",
                id: "e4727814-5d95-4e9c-9485-38ecdba6163f",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:40.152Z",
                id: "eca3645f-35a2-4419-8adc-a32b7fa81090",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.932Z",
                id: "8cdb8c25-c1ef-4634-a7e9-59e3e7e75b23",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.815Z",
                id: "7b4c2e91-b3e2-4fa4-9703-034b06288436",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.580Z",
                id: "88f653fb-0db8-4f26-bdd2-60fc90c560b5",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.478Z",
                id: "50ec3cb5-f250-40ae-8a46-2d0d68b6fd4d",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.259Z",
                id: "d9ae248f-6fdc-49ca-ac1c-6404de732d8b",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:39.147Z",
                id: "a605b4d0-6096-48c5-81be-79a51f334743",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:38.920Z",
                id: "403d957a-ba84-4a51-b6b8-543938a8ea35",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:38.817Z",
                id: "013d12cd-16f7-492c-a54a-89872023f9d3",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:38.560Z",
                id: "289cc4de-c5f5-485c-b9c2-fe99a325ff9c",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:38.453Z",
                id: "ab6c2107-c437-4e7e-97e8-ce90351a8db1",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
            {
                date: "2023-09-06T04:02:37.166Z",
                id: "9332e2cb-d08d-4973-8733-b71f5c5ea4e3",
                img: "",
                title: "Extensions",
                url: "edge://extensions/",
            },
        ],
        title: "06/09/2023, 09:32:35",
    },
    {
        id: crypto.randomUUID(),
        title: "testtetesttesttesttestteststtesttesttesttesttesttest",
        items: [
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1test1test1test1test1test1test1test1test1test1test1test1test1test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
        ],
    },
    {
        id: crypto.randomUUID(),
        title: "test",
        items: [
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
        ],
    },
    {
        id: crypto.randomUUID(),
        title: "test",
        items: [
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
            {
                date: "",
                id: crypto.randomUUID(),
                img: "",
                title: "test1",
                url: "http://localhost:5173/",
            },
        ],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
    {
        id: crypto.randomUUID(),
        title: "test324234",
        items: [],
    },
];

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
            chrome.storage.local
                .get("collectionData")
                .then(({ collectionData: _collectionData }) => {
                    if (_collectionData === undefined) {
                        setCollectionData([]);
                        chrome.storage.local.set({ collectionData });
                    } else setCollectionData(_collectionData);
                    setFirstDone(true);
                });

            const onStorageChangeListener = (changes: {
                [key: string]: chrome.storage.StorageChange;
            }) => {
                const c = changes.collectionData;
                if (c && !(c.newValue.length === 0 && c.oldValue.length !== 0))
                    setCollectionData(c.newValue);
            };

            chrome.storage.local.onChanged.addListener(onStorageChangeListener);
            return () => {
                chrome.storage.local.onChanged.removeListener(
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
            if (firstDone) chrome.storage.local.set({ collectionData });
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
        chrome.storage.local.get("backup").then(({ backup }) => {
            if (backup) {
                chrome.storage.local.set({ collectionData: backup });
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
