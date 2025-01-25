import browser from "webextension-polyfill";
import { appSettingSchema, getDataFromTab, initAppSetting, wait } from "./utils";
import {
    CollectionOperation,
    CollectionResponse,
    MessageResponse,
    CollectionMessage,
} from "./types/messages";

const CONTEXT_MENU_PARENT_ID_PAGE = "add-page-to-collections";
const CONTEXT_MENU_PARENT_ID_ALL_TABS = "add-all-tabs-to-collections";

const setAddPageToCollectionContextMenu = async () => {
    await browser.contextMenus.removeAll();
    //! this collectionData can be older compared to recentUsedCollections.
    const { recentlyUsedCollections, collectionData } = (await browser.storage.local.get([
        "recentlyUsedCollections",
        "collectionData",
    ])) as {
        recentlyUsedCollections: UUID[];
        collectionData: Collection[];
    };
    if (!collectionData && !recentlyUsedCollections) {
        console.error("collectionData and recentlyUsedCollections not found in storage");
        return;
    }
    browser.contextMenus.create({
        id: CONTEXT_MENU_PARENT_ID_PAGE,
        title: "Add page to collections",
        contexts: ["all"],
    });
    browser.contextMenus.create({
        id: CONTEXT_MENU_PARENT_ID_ALL_TABS,
        title: "Add all tabs to collections",
        contexts: ["all"],
    });

    browser.contextMenus.create({
        id: `collection-new-${CONTEXT_MENU_PARENT_ID_PAGE}`,
        title: "Add to new Collection",
        contexts: ["all"],
        parentId: CONTEXT_MENU_PARENT_ID_PAGE,
    });
    browser.contextMenus.create({
        id: `collection-new-${CONTEXT_MENU_PARENT_ID_ALL_TABS}`,
        title: "Add to new Collection",
        contexts: ["all"],
        parentId: CONTEXT_MENU_PARENT_ID_ALL_TABS,
    });

    if (Array.isArray(recentlyUsedCollections)) {
        //! can be heavy
        //todo optimize
        const collectionsBasic = collectionData.reduce((prev, curr) => {
            prev.set(curr.id, curr.title);
            return prev;
        }, new Map<UUID, string>());
        const collectionsToShow = recentlyUsedCollections
            .map((id) => {
                if (!collectionsBasic.has(id)) return null;
                return { id, title: collectionsBasic.get(id) as string };
            })
            .filter((col) => col !== null);
        collectionsBasic.forEach((title, id) => {
            if (recentlyUsedCollections.includes(id)) return;
            collectionsToShow.push({ id, title });
        });
        collectionsToShow.forEach((col) => {
            browser.contextMenus.create({
                id: `collection-${CONTEXT_MENU_PARENT_ID_PAGE}-${col.id}`,
                title: col.title,
                contexts: ["all"],
                parentId: CONTEXT_MENU_PARENT_ID_PAGE,
            });
            browser.contextMenus.create({
                id: `collection-${CONTEXT_MENU_PARENT_ID_ALL_TABS}-${col.id}`,
                title: col.title,
                contexts: ["all"],
                parentId: CONTEXT_MENU_PARENT_ID_ALL_TABS,
            });
        });
    }
};

//todo : make better backup system
const backup = () =>
    browser.storage.local.get("collectionData").then(({ collectionData }) => {
        if (!collectionData) return;
        if (collectionData instanceof Array && collectionData.length === 0) return;
        browser.storage.local.set({ backup: collectionData }).then(() => {
            browser.storage.local.set({
                lastBackup: new Date().toJSON(),
            });
        });
    });

browser.storage.local.onChanged.addListener(async (change) => {
    if (change.recentlyUsedCollections) {
        setAddPageToCollectionContextMenu();
    }
});
browser.runtime.onInstalled.addListener((e) => {
    if (e.reason === "update") {
        (() => {
            browser.storage.local.get("appSetting").then(({ appSetting }) => {
                if (appSetting) {
                    if (
                        !(appSetting as AppSettingType).version ||
                        (appSetting as AppSettingType).version < initAppSetting.version
                    ) {
                        const newSettings = appSettingSchema.parse(appSetting);
                        browser.storage.local.set({
                            appSetting: newSettings,
                        });
                    }
                }
            });
            browser.storage.local
                .get("recentlyUsedCollections")
                .then(({ recentlyUsedCollections }) => {
                    if (!recentlyUsedCollections) {
                        browser.storage.local.set({
                            recentlyUsedCollections: [],
                        });
                    }
                });
        })();
        if (e.previousVersion !== browser.runtime.getManifest().version)
            browser.tabs.create({
                active: true,
                url: "https://github.com/mienaiyami/collection-extension-2.0/blob/main/CHANGELOG.MD",
            });
    }
    if (e.reason === "install") {
        browser.tabs.create({
            active: true,
            url: "https://github.com/mienaiyami/collection-extension-2.0/blob/main/CHANGELOG.MD",
        });
        browser.storage.local.set({
            appSetting: initAppSetting,
        });
    }
    browser.alarms.create("backup", {
        delayInMinutes: 10,
        periodInMinutes: 10,
    });
    browser.contextMenus.onClicked.addListener(async (info, tab) => {
        // info.frameUrl does not exist in firefox
        const url = info.frameUrl || info.pageUrl;
        console.log(info, tab);
        if (!tab || !url) return;
        const isPage = info.menuItemId.toString().includes(CONTEXT_MENU_PARENT_ID_PAGE);
        const isAllTabs = info.menuItemId.toString().includes(CONTEXT_MENU_PARENT_ID_ALL_TABS);
        const id = info.menuItemId
            .toString()
            .replace(`-${CONTEXT_MENU_PARENT_ID_PAGE}`, "")
            .replace(`-${CONTEXT_MENU_PARENT_ID_ALL_TABS}`, "");
        if (id === "collection-new") {
            const response = await CollectionManager.makeNewCollection(new Date().toLocaleString());
            if (response.success) {
                // this sometimes does not work in firefox
                // if (info.parentMenuItemId === CONTEXT_MENU_PARENT_ID_PAGE) {
                if (isPage) {
                    await CollectionManager.addToCollection(
                        response.data.collection.id,
                        await getDataFromTab(tab)
                    );
                } else if (isAllTabs) {
                    const window = await browser.windows.getCurrent();
                    if (window)
                        await CollectionManager.addAllTabsToCollection(
                            response.data.collection.id,
                            window.id!
                        );
                }
            }
            return;
        }
        if (id.startsWith("collection-")) {
            const collectionId = id.replace("collection-", "") as UUID;
            if (isPage) {
                await CollectionManager.addToCollection(collectionId, await getDataFromTab(tab));
                return;
            } else if (isAllTabs) {
                const window = await browser.windows.getCurrent();
                if (window)
                    await CollectionManager.addAllTabsToCollection(collectionId, window.id!);
            }
            return;
        }
    });
    setAddPageToCollectionContextMenu();
});

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "backup") {
        browser.storage.local.get("lastBackup").then(({ lastBackup }) => {
            if (lastBackup && typeof lastBackup === "string") {
                const last = new Date(lastBackup);
                const now = new Date();
                if (now.getTime() - last.getTime() >= 1000 * 60 * 60 * 6) {
                    console.log("creating backup...");
                    backup();
                }
            } else {
                console.log("creating backup...");
                backup();
            }
        });
    }
});

// browser keyboard shortcuts
browser.commands.onCommand.addListener((command) => {
    if (command === "add-current-tab-to-active-collection") {
        // need to do this because background do not know about active collection;
        browser.runtime
            .sendMessage({
                type: "add-current-tab-to-active-collection",
            })
            .catch(console.error);
    }
});

//---------------------------------------------------------------

class CollectionManager {
    /** used when operations like rename,new so it need to be called after the item have been updated in store */
    private static WAIT_TIME_BEFORE_UPDATING_RECENTLY_USED = 3000;

    static async getCollectionData(): Promise<Collection[]> {
        const { collectionData } = await browser.storage.local.get("collectionData");
        return (collectionData as Collection[]) || [];
    }

    static async setCollectionData(data: Collection[]): Promise<void> {
        await browser.storage.local.set({ collectionData: data });
    }

    static async makeNewCollection(
        title: string,
        items: CollectionItem[] = [],
        fillByData = {
            /**pass activeTabId to fill active tab only */
            activeTabId: undefined as number | undefined,
            /** pass activeWindowId to fill with all tabs  */
            activeWindowId: undefined as number | undefined,
        }
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "MAKE_NEW_COLLECTION" }>>> {
        try {
            const collections = await this.getCollectionData();
            const newCollection: Collection = {
                id: crypto.randomUUID(),
                title,
                items,
                date: new Date().toISOString(),
            };
            if (fillByData.activeTabId) {
                const tab = await browser.tabs.get(fillByData.activeTabId);
                if (tab) {
                    newCollection.items.push(await getDataFromTab(tab));
                }
            } else if (fillByData.activeWindowId) {
                const tabs = await browser.tabs.query({
                    windowId: fillByData.activeWindowId,
                });
                newCollection.items.push(
                    ...(await Promise.all(
                        tabs.map(async (tab) => {
                            return await getDataFromTab(tab);
                        })
                    ))
                );
            }

            await this.setCollectionData([newCollection, ...collections]);
            this.updateRecentlyUsed(newCollection.id);

            return { success: true, data: { collection: newCollection } };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async removeCollections(
        ids: UUID | UUID[]
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "REMOVE_COLLECTIONS" }>>> {
        try {
            const collections = await this.getCollectionData();
            const idsToRemove = Array.isArray(ids) ? ids : [ids];
            const collectionsRemoved: string[] = [];
            const updatedCollections = collections.filter((col) => {
                if (idsToRemove.includes(col.id)) {
                    collectionsRemoved.push(col.title);
                    return false;
                }
                return true;
            });

            await this.setCollectionData(updatedCollections);
            // not awaited coz it make other things slow
            this.updateRecentlyUsed("deleted");

            return {
                success: true,
                data: { removedCollections: collectionsRemoved },
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async addTabToCollection(
        collectionId: UUID,
        tabId: number
    ): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "ADD_TAB_TO_COLLECTION" }>>
    > {
        try {
            const tab = await browser.tabs.get(tabId);
            if (!tab) {
                return { success: false, error: "No active tab found" };
            }
            const data = await getDataFromTab(tab);
            return await this.addToCollection(collectionId, data);
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }
    static async addAllTabsToCollection(
        collectionId: UUID,
        windowId: number
    ): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "ADD_ALL_TABS_TO_COLLECTION" }>>
    > {
        try {
            const tabs = await browser.tabs.query({
                windowId,
            });
            if (tabs.length === 0) {
                return { success: false, error: "No active tab found" };
            }
            const data = await Promise.all(
                tabs.map(async (tab) => {
                    return await getDataFromTab(tab);
                })
            );
            return await this.addToCollection(collectionId, data);
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async addToCollection(
        collectionId: UUID,
        items: CollectionItem | CollectionItem[]
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "ADD_TO_COLLECTION" }>>> {
        try {
            const collections = await this.getCollectionData();
            const collection = collections.find((e) => e.id === collectionId);
            if (!collection) {
                return { success: false, error: "Collection not found" };
            }

            const itemsToAdd = Array.isArray(items) ? items : [items];
            collection.items.unshift(...itemsToAdd);
            await this.setCollectionData(collections);
            this.updateRecentlyUsed(collectionId, 0);

            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // static async replaceCollection(
    //     id: UUID,
    //     items: CollectionItem[]
    // ): Promise<
    //     CollectionResponse<
    //         Extract<CollectionOperation, { type: "REPLACE_COLLECTION" }>
    //     >
    // > {
    //     try {
    //         const collections = await this.getCollectionData();
    //         const collection = collections.find((e) => e.id === id);
    //         if (!collection) {
    //             return { success: false, error: "Collection not found" };
    //         }

    //         collection.items = items;
    //         await this.setCollectionData(collections);

    //         return { success: true };
    //     } catch (error) {
    //         return { success: false, error: String(error) };
    //     }
    // }

    static async removeFromCollection(
        collectionId: UUID,
        itemId: UUID | UUID[]
    ): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "REMOVE_FROM_COLLECTION" }>>
    > {
        try {
            const collections = await this.getCollectionData();
            const collection = collections.find((e) => e.id === collectionId);
            if (!collection) {
                return { success: false, error: "Collection not found" };
            }

            const itemIds = Array.isArray(itemId) ? itemId : [itemId];
            collection.items = collection.items.filter((item) => !itemIds.includes(item.id));

            await this.setCollectionData(collections);
            this.updateRecentlyUsed(collectionId, 0);

            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async renameCollection(
        id: UUID,
        newName: string
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "RENAME_COLLECTION" }>>> {
        try {
            const collections = await this.getCollectionData();
            const collection = collections.find((e) => e.id === id);
            if (!collection) {
                return { success: false, error: "Collection not found" };
            }
            const oldName = collection.title;
            collection.title = newName;
            await this.setCollectionData(collections);
            this.updateRecentlyUsed("renamed");

            return {
                success: true,
                data: {
                    oldName,
                    newName,
                },
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async changeCollectionOrder(
        newOrder: UUID[]
    ): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "CHANGE_COLLECTION_ORDER" }>>
    > {
        try {
            const collections = await this.getCollectionData();
            collections.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
            await this.setCollectionData(collections);
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async changeCollectionItemOrder(
        colID: UUID,
        newOrder: UUID[]
    ): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "CHANGE_COLLECTION_ITEM_ORDER" }>>
    > {
        try {
            const collections = await this.getCollectionData();
            const collection = collections.find((e) => e.id === colID);
            if (!collection) {
                return { success: false, error: "Collection not found" };
            }

            collection.items.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

            await this.setCollectionData(collections);
            this.updateRecentlyUsed(colID, 0);

            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async exportData(): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "EXPORT_DATA" }>>
    > {
        try {
            const collections = await this.getCollectionData();
            return { success: true, data: { data: collections } };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async importData(
        data: Collection[]
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "IMPORT_DATA" }>>> {
        try {
            const collections = await this.getCollectionData();
            console.log(data);
            data.reverse().forEach((newCol) => {
                const existingIndex = collections.findIndex((col) => col.id === newCol.id);
                if (existingIndex >= 0) {
                    const existingItemIds = collections[existingIndex].items.map((e) => e.id);
                    newCol.items.forEach((item) => {
                        if (!existingItemIds.includes(item.id)) {
                            collections[existingIndex].items.unshift(item);
                        }
                    });
                } else {
                    collections.unshift(newCol);
                }
            });

            await this.setCollectionData(collections);
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    static async restoreBackup(): Promise<
        CollectionResponse<Extract<CollectionOperation, { type: "RESTORE_BACKUP" }>>
    > {
        try {
            const { backup } = (await browser.storage.local.get("backup")) as {
                backup: Collection[];
            };
            if (!backup) {
                return { success: false, error: "No backup found" };
            }

            await this.setCollectionData(backup);
            return { success: true, data: { restoredData: backup } };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    private static async updateRecentlyUsed(
        id: UUID | "deleted" | "renamed",
        delay = this.WAIT_TIME_BEFORE_UPDATING_RECENTLY_USED
    ): Promise<void> {
        if (delay) {
            await wait(delay);
        }

        const { recentlyUsedCollections = [] } = (await browser.storage.local.get(
            "recentlyUsedCollections"
        )) as {
            recentlyUsedCollections: UUID[];
        };

        if (id === "deleted") {
            const collections = await this.getCollectionData();
            const validIds = collections.map((col) => col.id);
            const updatedList = recentlyUsedCollections.filter((id) => validIds.includes(id));
            await browser.storage.local.set({
                recentlyUsedCollections: updatedList,
            });
            return;
        }
        if (id === "renamed") {
            // its not called from listener coz UUID value stays same
            // need to call this manually to reflect new name;
            await setAddPageToCollectionContextMenu();
            return;
        }

        const updatedList = [
            id,
            ...recentlyUsedCollections.filter((existingId) => existingId !== id),
        ].slice(0, 10);

        await browser.storage.local.set({
            recentlyUsedCollections: updatedList,
        });
    }

    static async updateAppSetting(
        update: Partial<AppSettingType>
    ): Promise<CollectionResponse<Extract<CollectionOperation, { type: "SET_APP_SETTING" }>>> {
        const { appSetting } = (await browser.storage.local.get("appSetting")) as {
            appSetting: AppSettingType;
        };
        if (!appSetting) {
            return { success: false, error: "App setting not found" };
        }
        const newSetting = { ...appSetting, ...update };
        await browser.storage.local.set({ appSetting: newSetting });
        return { success: true };
    }
}

function isCollectionOperation(message: unknown): message is CollectionMessage {
    return typeof message === "object" && message !== null && "type" in message;
}

browser.runtime.onMessage.addListener(
    async (message: unknown): Promise<MessageResponse<CollectionMessage>> => {
        if (!isCollectionOperation(message)) {
            return { success: false, error: "Invalid message format" };
        }
        try {
            switch (message.type) {
                case "MAKE_NEW_COLLECTION":
                    return await CollectionManager.makeNewCollection(
                        message.payload.title,
                        message.payload.items,
                        {
                            activeTabId: message.payload.fillByData?.activeTabId,
                            activeWindowId: message.payload.fillByData?.activeWindowId,
                        }
                    );
                case "REMOVE_COLLECTIONS":
                    return await CollectionManager.removeCollections(message.payload);
                case "ADD_TO_COLLECTION":
                    return await CollectionManager.addToCollection(
                        message.payload.collectionId,
                        message.payload.items
                    );
                case "ADD_TAB_TO_COLLECTION":
                    return await CollectionManager.addTabToCollection(
                        message.payload.collectionId,
                        message.payload.tabId
                    );
                case "ADD_ALL_TABS_TO_COLLECTION":
                    return await CollectionManager.addAllTabsToCollection(
                        message.payload.collectionId,
                        message.payload.windowId
                    );
                case "REMOVE_FROM_COLLECTION":
                    return await CollectionManager.removeFromCollection(
                        message.payload.collectionId,
                        message.payload.itemId
                    );
                case "RENAME_COLLECTION":
                    return await CollectionManager.renameCollection(
                        message.payload.id,
                        message.payload.newName
                    );
                case "CHANGE_COLLECTION_ORDER":
                    return await CollectionManager.changeCollectionOrder(message.payload);
                case "CHANGE_COLLECTION_ITEM_ORDER":
                    return await CollectionManager.changeCollectionItemOrder(
                        message.payload.colID,
                        message.payload.newOrder
                    );
                case "EXPORT_DATA":
                    return await CollectionManager.exportData();
                case "IMPORT_DATA":
                    return await CollectionManager.importData(message.payload);
                case "RESTORE_BACKUP":
                    return await CollectionManager.restoreBackup();
                case "SET_COLLECTIONS_DANGEROUSLY":
                    await CollectionManager.setCollectionData(message.payload);
                    return { success: true };
                case "SET_APP_SETTING":
                    return await CollectionManager.updateAppSetting(message.payload);
                default:
                    return { success: false, error: "Unknown operation type" };
            }
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }
);
