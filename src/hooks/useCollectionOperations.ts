import { useCallback } from "react";
import browser from "webextension-polyfill";
import { CollectionOperation, MessageResponse } from "../types/messages";
import { toast } from "sonner";

export const useCollectionOperations = () => {
    const sendMessage = useCallback(
        <Type extends CollectionOperation["type"]>(
            operation: { type: Type } & Omit<
                Extract<CollectionOperation, { type: Type }>,
                "response"
            >
        ): Promise<MessageResponse<Extract<CollectionOperation, { type: Type }>>> => {
            try {
                return browser.runtime.sendMessage(operation);
            } catch (error) {
                console.error("Operation failed:", error);
                return Promise.resolve({
                    success: false,
                    error: String(error),
                });
            }
        },
        []
    );

    const makeNewCollection = useCallback(
        async (
            title: string,
            items: CollectionItem[] = [],
            fillByData?: {
                activeTabId?: number;
                activeWindowId?: number;
            }
        ) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "MAKE_NEW_COLLECTION",
                payload: { title, items, fillByData },
            });
            if (!response.success) {
                toast.error("Failed to create collection", {
                    description: response.error,
                });
                return response;
            }
            return response;
        },
        [sendMessage]
    );

    const removeCollections = useCallback(
        async (ids: UUID | UUID[]) => {
            toast.dismiss();
            //todo : make better undo
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error("Failed to remove collections", {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "REMOVE_COLLECTIONS",
                payload: ids,
            });
            if (!response.success) {
                toast.error("Failed to remove collections", {
                    description: response.error,
                });
                return response;
            }
            let displayText = response.data.removedCollections.join(", ");
            //todo: test which length is better for ui
            if (displayText.length > 30) {
                displayText =
                    `{${response.data.removedCollections.length}: }` +
                    displayText.slice(0, 50) +
                    "...";
            }
            toast.success("Removed Collections", {
                description: `[${displayText}] removed.`,
                duration: 10000,
                action: {
                    label: "Undo",
                    onClick: async () => {
                        await sendMessage({
                            type: "IMPORT_DATA",
                            payload: oldState.data.data,
                        });
                    },
                },
            });
            return response;
        },
        [sendMessage]
    );

    const addActiveTabToCollection = useCallback(
        async (collectionId: UUID) => {
            toast.dismiss();
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (!tabs.length) {
                toast.error("No active tab found");
                return;
            }
            const tabId = tabs[0].id!;
            const response = await sendMessage({
                type: "ADD_TAB_TO_COLLECTION",
                payload: { collectionId, tabId },
            });
            if (!response.success) {
                toast.error("Failed to add active tab to collection", {
                    description: response.error,
                });
                return response;
            }
        },
        [sendMessage]
    );
    const addAllTabsToCollection = useCallback(
        async (collectionId: UUID) => {
            toast.dismiss();
            const activeWindow = await browser.windows.getCurrent();
            if (!activeWindow) {
                toast.error("Failed to get active window");
                return;
            }
            const windowId = activeWindow.id!;
            const response = await sendMessage({
                type: "ADD_ALL_TABS_TO_COLLECTION",
                payload: { collectionId, windowId },
            });
            if (!response.success) {
                toast.error("Failed to add all tabs to collection", {
                    description: response.error,
                });
                return response;
            }
        },
        [sendMessage]
    );

    const addToCollection = useCallback(
        async (
            collectionId: UUID,
            items: CollectionItem | CollectionItem[],
            redoEnabled = false
        ) => {
            toast.dismiss();
            const oldState = redoEnabled && (await sendMessage({ type: "EXPORT_DATA" }));
            const response = await sendMessage({
                type: "ADD_TO_COLLECTION",
                payload: { collectionId, items },
            });

            if (!response.success) {
                toast.error("Failed to add to collection", {
                    description: response.error,
                });
                return response;
            }
            const message = Array.isArray(items)
                ? `Added ${items.length} items to collection`
                : "Added to collection";
            if (redoEnabled && oldState && oldState.success) {
                toast.success(message, {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            await sendMessage({
                                type: "SET_COLLECTIONS_DANGEROUSLY",
                                payload: oldState.data.data,
                            });
                        },
                    },
                });
            } else toast.success(message);
            return response;
        },
        [sendMessage]
    );

    const removeFromCollection = useCallback(
        async (collectionId: UUID, itemId: UUID | UUID[]) => {
            toast.dismiss();
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error("Failed to remove from collection", {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "REMOVE_FROM_COLLECTION",
                payload: { collectionId, itemId },
            });

            if (!response.success) {
                toast.error("Failed to remove from collection", {
                    description: response.error,
                });
                return response;
            }

            const itemCount = Array.isArray(itemId) ? itemId.length : 1;
            toast.success("Removed from Collection", {
                description: `Removed ${itemCount} item(s) from collection.`,
                duration: itemCount > 10 ? 10000 : 5000,
                action: {
                    label: "Undo",
                    onClick: async () => {
                        await sendMessage({
                            type: "IMPORT_DATA",
                            payload: oldState.data.data,
                        });
                    },
                },
            });
            return response;
        },
        [sendMessage]
    );

    const renameCollection = useCallback(
        async (id: UUID, newName: string) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "RENAME_COLLECTION",
                payload: { id, newName },
            });

            if (!response.success) {
                toast.error("Failed to rename collection", {
                    description: response.error,
                });
                return response;
            }

            toast.success("Renamed Collection", {
                description: `Collection "${response.data.oldName}" renamed to "${newName}".`,
                duration: 5000,
                action: {
                    label: "Undo",
                    onClick: async () => {
                        await sendMessage({
                            type: "RENAME_COLLECTION",
                            payload: { id, newName: response.data.oldName },
                        });
                    },
                },
            });
            return response;
        },
        [sendMessage]
    );

    const changeCollectionOrder = useCallback(
        async (newOrder: UUID[]) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "CHANGE_COLLECTION_ORDER",
                payload: newOrder,
            });

            if (!response.success) {
                toast.error("Failed to reorder collections", {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage]
    );

    const changeCollectionItemOrder = useCallback(
        async (colID: UUID, newOrder: UUID[]) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "CHANGE_COLLECTION_ITEM_ORDER",
                payload: { colID, newOrder },
            });

            if (!response.success) {
                toast.error("Failed to reorder items", {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage]
    );

    const exportData = useCallback(async () => {
        const response = await sendMessage({ type: "EXPORT_DATA" });
        if (!response.success) {
            toast.error("Failed to export data", {
                description: response.error,
            });
            return response;
        }

        const saveData = JSON.stringify(response.data.data, null, "\t");
        const downloadName = `collection-backup-${new Date().toJSON()}`;

        if (window.showSaveFilePicker) {
            const fileHandle = await window.showSaveFilePicker({
                types: [
                    {
                        description: "JSON Files",
                        accept: {
                            "application/json": [".json"],
                        },
                    },
                ],
                suggestedName: downloadName,
            });
            const stream = await fileHandle.createWritable();
            await stream.write(saveData);
            await stream.close();
            return response;
        }
        const a = document.createElement("a");
        const file = new Blob([saveData], {
            type: "application/json",
        });
        a.href = URL.createObjectURL(file);
        a.download = downloadName + ".json";
        a.click();
        URL.revokeObjectURL(a.href);
        return response;
    }, [sendMessage]);

    const importData = useCallback(async () => {
        try {
            toast.dismiss();
            let file: File;
            if (window.showOpenFilePicker) {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [
                        {
                            description: "JSON Files",
                            accept: {
                                "application/json": [".json"],
                            },
                        },
                    ],
                    multiple: false,
                });
                file = await fileHandle.getFile();
            } else {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.click();
                file = await new Promise((resolve, reject) => {
                    input.onchange = () => {
                        if (input.files?.length) {
                            resolve(input.files[0]);
                        } else {
                            reject(new Error("No file selected"));
                        }
                    };
                });
            }
            if (!file) {
                return { success: false, error: "No file selected" };
            }
            const text = await file.text();
            const data = JSON.parse(text);
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error("Failed to import data", {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "IMPORT_DATA",
                payload: data,
            });
            if (!response.success) {
                toast.error("Failed to import data", {
                    description: response.error,
                });
            }
            toast.success("Imported Successfully", {
                description: `Imported ${data.length} collection(s).`,
                duration: 20000,
                action: {
                    label: "Undo",
                    onClick: () => {
                        sendMessage({
                            type: "SET_COLLECTIONS_DANGEROUSLY",
                            payload: oldState.data.data,
                        });
                    },
                },
            });
            return response;
        } catch (error) {
            console.error(error);
            toast.error("Failed to import data", {
                description: String(error),
            });
            return { success: false, error: String(error) };
        }
    }, [sendMessage]);

    const restoreBackup = useCallback(async () => {
        toast.dismiss();
        const oldState = await sendMessage({ type: "EXPORT_DATA" });
        if (!oldState.success) {
            toast.error("Failed to restore backup", {
                description: oldState.error,
            });
            return oldState;
        }

        const response = await sendMessage({ type: "RESTORE_BACKUP" });
        if (!response.success) {
            toast.error("Failed to restore backup", {
                description: response.error,
            });
            return response;
        }
        toast.success("Restored Backup", {
            duration: 20000,
            action: {
                label: "Undo",
                onClick: async () => {
                    await sendMessage({
                        type: "SET_COLLECTIONS_DANGEROUSLY",
                        payload: oldState.data.data,
                    });
                },
            },
        });
        return response;
    }, [sendMessage]);

    const createLocalBackup = useCallback(async () => {
        const response = await sendMessage({ type: "CREATE_LOCAL_BACKUP" });
        if (!response.success) {
            toast.error("Failed to create local backup", {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage]);

    const setAppSetting = useCallback(
        async (payload: Partial<AppSettingType>) => {
            const response = await sendMessage({
                type: "SET_APP_SETTING",
                payload,
            });
            if (!response.success) {
                toast.error("Failed to set app setting", {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage]
    );

    // google drive stuff

    const getGoogleDriveLoginStatus = useCallback(async () => {
        const response = await sendMessage({ type: "GOOGLE_DRIVE_LOGIN_STATUS" });
        if (!response.success) {
            toast.error("Failed to get login status", {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage]);

    const loginGoogleDrive = useCallback(async () => {
        const response = await sendMessage({ type: "LOGIN_GOOGLE_DRIVE" });
        if (!response.success) {
            toast.error("Failed to login", {
                description: response.error,
            });
        } else {
            toast.success("Logged in to Google Drive");
        }
        return response;
    }, [sendMessage]);

    const logoutGoogleDrive = useCallback(async () => {
        const response = await sendMessage({ type: "LOGOUT_GOOGLE_DRIVE" });
        if (!response.success) {
            toast.error("Failed to logout", {
                description: response.error,
            });
        } else {
            toast.success("Logged out from Google Drive");
        }
        return response;
    }, [sendMessage]);

    const getGoogleDriveUserInfo = useCallback(async () => {
        const response = await sendMessage({ type: "GOOGLE_DRIVE_USER_INFO" });
        if (!response.success) {
            toast.error("Failed to get user info", {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage]);

    const googleDriveSyncNow = useCallback(async () => {
        const response = await sendMessage({ type: "GOOGLE_DRIVE_SYNC_NOW" });
        if (!response.success) {
            toast.error("Failed to sync now", {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage]);

    const getGoogleDriveSyncState = useCallback(async () => {
        const response = await sendMessage({ type: "GET_GOOGLE_DRIVE_SYNC_STATE" });
        if (!response.success) {
            toast.error("Failed to get sync state", {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage]);

    const deleteAllLocalCollectionsData = useCallback(async () => {
        const response = await sendMessage({ type: "DELETE_ALL_LOCAL_COLLECTIONS_DATA" });
        if (!response.success) {
            toast.error("Failed to delete all local collections", {
                description: response.error,
            });
        } else {
            toast.success("Deleted all local collections.");
        }
        return response;
    }, [sendMessage]);
    const deleteAllGDriveSyncedCollectionData = useCallback(async () => {
        const response = await sendMessage({ type: "DELETE_ALL_GDRIVE_SYCNED_COLLECTION_DATA" });
        if (!response.success) {
            toast.error("Failed to delete all gdrive synced collections", {
                description: response.error,
            });
        } else {
            toast.success("Deleted all gdrive synced collections.");
        }
        return response;
    }, [sendMessage]);

    return {
        removeCollections,
        makeNewCollection,
        addToCollection,
        addActiveTabToCollection,
        addAllTabsToCollection,
        removeFromCollection,
        renameCollection,
        changeCollectionOrder,
        changeCollectionItemOrder,
        exportData,
        importData,
        restoreBackup,
        createLocalBackup,
        setAppSetting,

        getGoogleDriveLoginStatus,
        loginGoogleDrive,
        logoutGoogleDrive,
        getGoogleDriveUserInfo,
        googleDriveSyncNow,
        getGoogleDriveSyncState,

        deleteAllLocalCollectionsData,
        deleteAllGDriveSyncedCollectionData,
    };
};
