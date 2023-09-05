import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useState,
} from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import CollectionView from "./components/CollectionView";
import TopBar from "./components/TopBar";
import { Toaster } from "@/components/ui/toaster";
import CollectionItemView from "./components/CollectionItemView";
import { useToast } from "./components/ui/use-toast";
/**
 // todo, use toast for console.error
*/

const testData: Collection[] = [
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
    const [first, setFirst] = useState(false);

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
        if (!first) {
            setFirst(true);
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
                    });
            }
        }
    }, [first]);

    useLayoutEffect(() => {
        if (import.meta.env.DEV) {
            setCollectionData(testData);
        } else {
            chrome.storage.local.set({ collectionData });
        }
    }, [collectionData]);

    const openCollection = (uuid: UUID | null) => {
        if (uuid) {
            const index = collectionData.findIndex((e) => e.id === uuid);
            if (index >= 0) setInCollectionView(uuid);
            else
                console.error(
                    `openCollection: Collection with id ${uuid} not found.`
                );
        } else if (inCollectionView) setInCollectionView(null);
    };

    const makeNewCollection = (title: string, items: CollectionItem[] = []) => {
        setCollectionData((init) => [
            {
                id: crypto.randomUUID(),
                title,
                items,
                date: new Date().toISOString(),
            },
            ...init,
        ]);
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
            if (newItem instanceof Array)
                collectionData[col].items.unshift(...newItem);
            else collectionData[col].items.unshift(newItem);
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

    const changeCollectionOrder = (id: UUID, newIndex: string) => {
        // todo
    };
    const changeCollectionItemOrder = (id: UUID, newIndex: string) => {
        // todo
    };
    // const editCollection = (id:UUID,changes:Partial<Omit<Collection,"id"|"date"|"items">>)=>{
    // }
    const renameCollection = (id: UUID, newName: string) => {
        const index = collectionData.findIndex((e) => e.id === id);
        if (index >= 0) {
            collectionData[index].title = newName;
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
                }}
            >
                <div className="w-full h-full">
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
