import browser from "webextension-polyfill";
import { appSettingSchema, initAppSetting } from "./utils";

/** for both recently used and updated*/
const RECENTLY_USED_COLLECTIONS_LIMIT = 10;
const setAddPageToCollectionContextMenu = async () => {
    await browser.contextMenus.removeAll();
    const { recentlyUsedCollections, collectionData } =
        (await browser.storage.local.get([
            "recentlyUsedCollections",
            "collectionData",
        ])) as {
            recentlyUsedCollections: UUID[];
            collectionData: Collection[];
        };
    if (!collectionData && !recentlyUsedCollections) {
        console.error(
            "collectionData and recentlyUsedCollections not found in storage"
        );
        return;
    }
    const parentId = "add-page-to-collections";
    browser.contextMenus.create({
        id: parentId,
        title: "Add page to collections",
        contexts: ["all"],
    });
    browser.contextMenus.create({
        id: `collection-new`,
        title: "Add to new Collection",
        contexts: ["all"],
        parentId,
    });
    if (Array.isArray(recentlyUsedCollections)) {
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
                id: `collection-${col.id}`,
                title: col.title,
                contexts: ["all"],
                parentId,
            });
        });
    }
};

const backup = () =>
    browser.storage.local.get("collectionData").then(({ collectionData }) => {
        if (!collectionData) return;
        if (collectionData instanceof Array && collectionData.length === 0)
            return;
        browser.storage.local.set({ backup: collectionData }).then(() => {
            browser.storage.local.set({
                lastBackup: new Date().toJSON(),
            });
        });
    });

browser.runtime.onInstalled.addListener((e) => {
    console.log(e);
    if (e.reason === "update") {
        (() => {
            browser.storage.local.get("appSetting").then(({ appSetting }) => {
                if (appSetting) {
                    if (
                        !(appSetting as AppSettingType).version ||
                        (appSetting as AppSettingType).version <
                            initAppSetting.version
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
    browser.contextMenus.onClicked.addListener((info, tab) => {
        if (!info.frameUrl) return;
        const id = info.menuItemId.toString();
        if (id === "collection-new") {
            browser.storage.local
                .get("collectionData")
                .then(({ collectionData }) => {
                    if (!collectionData) return;
                    //todo make functions for these and then use those for saving from frontend as well
                    const newCollection: Collection = {
                        title: new Date().toLocaleString(),
                        id: globalThis.crypto.randomUUID(),
                        items: [
                            {
                                url: info.frameUrl as string,
                                title: tab?.title as string,
                                date: new Date().toISOString(),
                                id: globalThis.crypto.randomUUID(),
                                //todo get page ss
                                img: tab?.favIconUrl as string,
                            },
                        ],
                    };
                    (collectionData as Collection[]).unshift(newCollection);
                    browser.storage.local.set({ collectionData });
                });
            return;
        }
        if (id.startsWith("collection-")) {
            browser.storage.local
                .get("collectionData")
                .then(({ collectionData }) => {
                    if (!collectionData) return;
                    (collectionData as Collection[])
                        .find((col) => col.id === id.replace("collection-", ""))
                        ?.items.unshift({
                            url: info.frameUrl as string,
                            title: tab?.title as string,
                            date: new Date().toISOString(),
                            id: globalThis.crypto.randomUUID(),
                            img: tab?.favIconUrl as string,
                        });
                    browser.storage.local.set({ collectionData });
                });
            return;
        }
    });
    setAddPageToCollectionContextMenu();
});

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "backup") {
        //todo test
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
        //todo later do all collection storing function in background.ts
        browser.runtime
            .sendMessage({
                type: "add-current-tab-to-active-collection",
            })
            .catch(console.error);
    }
});

const updateRecentlyUsedCollections = (collectionId: string) => {
    browser.storage.local
        .get("recentlyUsedCollections")
        .then(({ recentlyUsedCollections }) => {
            const collections = (recentlyUsedCollections || []) as string[];
            if (collections.includes(collectionId)) return;
            if (collections.length >= RECENTLY_USED_COLLECTIONS_LIMIT)
                collections.pop();
            collections.unshift(collectionId);
            browser.storage.local.set({
                recentlyUsedCollections: collections,
            });
        });
};

interface Message {
    type: string;
    payload?: unknown;
}
//todo migrate from appjs to here
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message as Message;
    if (!type) {
        console.error("message type is not defined");
        return;
    }
    console.log(message);
    switch (type) {
        case "update-recently-used-collections": {
            const collectionId = payload as string;
            if (!collectionId) return;
            updateRecentlyUsedCollections(collectionId);
            break;
        }
    }
    return true;
});

browser.storage.local.onChanged.addListener(async (change) => {
    if (change.recentlyUsedCollections) {
        await browser.contextMenus.removeAll();
        console.log(browser.contextMenus);
        //todo test
        setAddPageToCollectionContextMenu();
    }
});
