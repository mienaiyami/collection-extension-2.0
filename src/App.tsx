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
/**
 // todo, use toast for console.error
*/

const testData: Collection[] = [
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
];

type AppContextType = {
    collectionData: Collection[];
    setCollectionData: React.Dispatch<React.SetStateAction<Collection[]>>;
    inCollectionView: UUID | null;
    openCollection: (uuid: UUID | null) => void;
    makeNewCollection: (title: string, items?: CollectionItem[]) => void;
    removeCollections: (id: UUID | UUID[]) => void;
    addToCollection: (
        collectionId: UUID,
        newItem: CollectionItem | CollectionItem[]
    ) => void;
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

    //todo test, remove/improve later
    useLayoutEffect(() => {
        if (import.meta.env.DEV) {
            setCollectionData(testData);
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
        if (id instanceof Array) {
            const init = [...collectionData];
            id.forEach((_id) => {
                const index = collectionData.findIndex((e) => e.id === _id);
                if (index >= 0) {
                    init.splice(index, 1);
                } else
                    console.error(
                        `removeCollections: Collection with id ${_id} not found.`
                    );
            });
            //todo, provide undo?
            setCollectionData(init);
        }
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
            console.error(
                `addToCollection: Collection with id ${collectionId} not found.`
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
            console.error(
                `renameCollection: Collection with id ${id} not found.`
            );
    };
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppContext.Provider
                value={{
                    collectionData,
                    setCollectionData,
                    inCollectionView,
                    addToCollection,
                    openCollection,
                    makeNewCollection,
                    removeCollections,
                }}
            >
                {/*//todo, remove ring later */}
                <div className="ring-inset ring-1 ring-current w-full h-full">
                    <TopBar />
                    <CollectionView />
                </div>
                <Toaster />
            </AppContext.Provider>
        </ThemeProvider>
    );
};

export default App;
