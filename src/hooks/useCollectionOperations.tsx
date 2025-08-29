import { createContext, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import browser from "webextension-polyfill";
import type {
    CollectionOperation,
    CollectionOperationResponse,
    MessageResponse,
} from "../types/messages";

type CollectionOperationsContextType = {
    removeCollections: (
        ids: UUID | UUID[]
    ) => CollectionOperationResponse<"REMOVE_COLLECTIONS">;
    makeNewCollection: (
        title: string,
        items?: CollectionItem[],
        fillByData?: { activeTabId?: number; activeWindowId?: number }
    ) => CollectionOperationResponse<"MAKE_NEW_COLLECTION">;
    addToCollection: (
        collectionId: UUID,
        items: CollectionItem | CollectionItem[],
        redoEnabled?: boolean
    ) => CollectionOperationResponse<"ADD_TO_COLLECTION">;
    addActiveTabToCollection: (
        collectionId: UUID
    ) => Promise<
        | MessageResponse<
              Extract<CollectionOperation, { type: "ADD_TAB_TO_COLLECTION" }>
          >
        | undefined
    >;
    addAllTabsToCollection: (
        collectionId: UUID
    ) => Promise<
        | MessageResponse<
              Extract<
                  CollectionOperation,
                  { type: "ADD_ALL_TABS_TO_COLLECTION" }
              >
          >
        | undefined
    >;
    removeFromCollection: (
        collectionId: UUID,
        itemId: UUID | UUID[]
    ) => CollectionOperationResponse<"REMOVE_FROM_COLLECTION">;
    renameCollection: (
        id: UUID,
        newName: string
    ) => CollectionOperationResponse<"RENAME_COLLECTION">;
    changeCollectionOrder: (
        newOrder: UUID[]
    ) => CollectionOperationResponse<"CHANGE_COLLECTION_ORDER">;
    changeCollectionItemOrder: (
        colID: UUID,
        newOrder: UUID[]
    ) => CollectionOperationResponse<"CHANGE_COLLECTION_ITEM_ORDER">;
    exportData: () => CollectionOperationResponse<"EXPORT_DATA">;
    importData: () => CollectionOperationResponse<"IMPORT_DATA">;
    restoreBackup: () => CollectionOperationResponse<"RESTORE_BACKUP">;
    createLocalBackup: () => CollectionOperationResponse<"CREATE_LOCAL_BACKUP">;
    setAppSetting: (
        payload: Partial<AppSettingType>
    ) => CollectionOperationResponse<"SET_APP_SETTING">;
    getGoogleDriveLoginStatus: () => CollectionOperationResponse<"GOOGLE_DRIVE_LOGIN_STATUS">;
    loginGoogleDrive: () => CollectionOperationResponse<"LOGIN_GOOGLE_DRIVE">;
    logoutGoogleDrive: () => CollectionOperationResponse<"LOGOUT_GOOGLE_DRIVE">;
    getGoogleDriveUserInfo: () => CollectionOperationResponse<"GOOGLE_DRIVE_USER_INFO">;
    googleDriveSyncNow: () => CollectionOperationResponse<"GOOGLE_DRIVE_SYNC_NOW">;
    getGoogleDriveSyncState: () => CollectionOperationResponse<"GET_GOOGLE_DRIVE_SYNC_STATE">;
    deleteAllLocalCollectionsData: () => CollectionOperationResponse<"DELETE_ALL_LOCAL_COLLECTIONS_DATA">;
    deleteAllGDriveSyncedCollectionData: () => CollectionOperationResponse<"DELETE_ALL_GDRIVE_SYCNED_COLLECTION_DATA">;
};

const CollectionOperationsContext =
    createContext<CollectionOperationsContextType | null>(null);

export const useCollectionOperations = () => {
    const context = useContext(CollectionOperationsContext);
    if (!context) throw new Error("CollectionOperationsContext not found");
    return context;
};

export const CollectionOperationsProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { t } = useTranslation();

    const sendMessage = useCallback(
        <Type extends CollectionOperation["type"]>(
            operation: { type: Type } & Omit<
                Extract<CollectionOperation, { type: Type }>,
                "response"
            >
        ): Promise<
            MessageResponse<Extract<CollectionOperation, { type: Type }>>
        > => {
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
                toast.error(t("messages.failedToCreateCollection"), {
                    description: response.error,
                });
                return response;
            }
            return response;
        },
        [sendMessage, t]
    );

    const removeCollections = useCallback(
        async (ids: UUID | UUID[]) => {
            toast.dismiss();
            //todo : make better undo
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error(t("messages.failedToRemoveCollections"), {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "REMOVE_COLLECTIONS",
                payload: ids,
            });
            if (!response.success) {
                toast.error(t("messages.failedToRemoveCollections"), {
                    description: response.error,
                });
                return response;
            }
            let displayText = response.data.removedCollections.join(", ");
            if (displayText.length > 30) {
                displayText =
                    `{${response.data.removedCollections.length}: }` +
                    displayText.slice(0, 50) +
                    "...";
            }
            toast.success(t("messages.removedCollections"), {
                description: t("messages.removedCollectionsDesc", {
                    collections: `[${displayText}]`,
                }),
                duration: 10000,
                action: {
                    label: t("common.undo"),
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
        [sendMessage, t]
    );

    const addActiveTabToCollection = useCallback(
        async (collectionId: UUID) => {
            toast.dismiss();
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (!tabs.length) {
                toast.error(t("messages.noActiveTab"));
                return;
            }
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const tabId = tabs[0].id!;
            const response = await sendMessage({
                type: "ADD_TAB_TO_COLLECTION",
                payload: { collectionId, tabId },
            });
            if (!response.success) {
                toast.error(t("messages.failedToAddActiveTab"), {
                    description: response.error,
                });
                return response;
            }
        },
        [sendMessage, t]
    );
    const addAllTabsToCollection = useCallback(
        async (collectionId: UUID) => {
            toast.dismiss();
            const activeWindow = await browser.windows.getCurrent();
            if (!activeWindow?.id) {
                toast.error(t("messages.failedToGetActiveWindow"));
                return;
            }
            const windowId = activeWindow.id;
            const response = await sendMessage({
                type: "ADD_ALL_TABS_TO_COLLECTION",
                payload: { collectionId, windowId },
            });
            if (!response.success) {
                toast.error(t("messages.failedToAddAllTabs"), {
                    description: response.error,
                });
                return response;
            }
        },
        [sendMessage, t]
    );

    const addToCollection = useCallback(
        async (
            collectionId: UUID,
            items: CollectionItem | CollectionItem[],
            redoEnabled = false
        ) => {
            toast.dismiss();
            const oldState =
                redoEnabled && (await sendMessage({ type: "EXPORT_DATA" }));
            const response = await sendMessage({
                type: "ADD_TO_COLLECTION",
                payload: { collectionId, items },
            });

            if (!response.success) {
                toast.error(t("messages.failedToAddToCollection"), {
                    description: response.error,
                });
                return response;
            }
            const message = Array.isArray(items)
                ? t("messages.addedItemsToCollection", { count: items.length })
                : t("messages.addedToCollection");
            if (redoEnabled && oldState && oldState.success) {
                toast.success(message, {
                    action: {
                        label: t("common.undo"),
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
        [sendMessage, t]
    );

    const removeFromCollection = useCallback(
        async (collectionId: UUID, itemId: UUID | UUID[]) => {
            toast.dismiss();
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error(t("messages.failedToRemoveFromCollection"), {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "REMOVE_FROM_COLLECTION",
                payload: { collectionId, itemId },
            });

            if (!response.success) {
                toast.error(t("messages.failedToRemoveFromCollection"), {
                    description: response.error,
                });
                return response;
            }

            const itemCount = Array.isArray(itemId) ? itemId.length : 1;
            toast.success(t("messages.removedFromCollection"), {
                description: t("messages.removedFromCollectionCount", {
                    count: itemCount,
                }),
                duration: itemCount > 10 ? 10000 : 5000,
                action: {
                    label: t("common.undo"),
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
        [sendMessage, t]
    );

    const renameCollection = useCallback(
        async (id: UUID, newName: string) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "RENAME_COLLECTION",
                payload: { id, newName },
            });

            if (!response.success) {
                toast.error(t("messages.failedToRenameCollection"), {
                    description: response.error,
                });
                return response;
            }

            toast.success(t("messages.renamedCollection"), {
                description: t("messages.renamedCollectionDesc", {
                    oldName: response.data.oldName,
                    newName: newName,
                }),
                duration: 5000,
                action: {
                    label: t("common.undo"),
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
        [sendMessage, t]
    );

    const changeCollectionOrder = useCallback(
        async (newOrder: UUID[]) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "CHANGE_COLLECTION_ORDER",
                payload: newOrder,
            });

            if (!response.success) {
                toast.error(t("messages.failedToReorderCollections"), {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage, t]
    );

    const changeCollectionItemOrder = useCallback(
        async (colID: UUID, newOrder: UUID[]) => {
            toast.dismiss();
            const response = await sendMessage({
                type: "CHANGE_COLLECTION_ITEM_ORDER",
                payload: { colID, newOrder },
            });

            if (!response.success) {
                toast.error(t("messages.failedToReorderItems"), {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage, t]
    );

    const exportData = useCallback(async () => {
        const response = await sendMessage({ type: "EXPORT_DATA" });
        if (!response.success) {
            toast.error(t("messages.failedToExportData"), {
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
    }, [sendMessage, t]);

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
                return { success: false, error: t("messages.noFileSelected") };
            }
            const text = await file.text();
            const data = JSON.parse(text);
            const oldState = await sendMessage({ type: "EXPORT_DATA" });
            if (!oldState.success) {
                toast.error(t("messages.failedToImportData"), {
                    description: oldState.error,
                });
                return oldState;
            }
            const response = await sendMessage({
                type: "IMPORT_DATA",
                payload: data,
            });
            if (!response.success) {
                toast.error(t("messages.failedToImportData"), {
                    description: response.error,
                });
            }
            toast.success(t("messages.importedSuccessfully"), {
                description: t("messages.importedCount", {
                    count: data.length,
                }),
                duration: 20000,
                action: {
                    label: t("common.undo"),
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
            toast.error(t("messages.failedToImportData"), {
                description: String(error),
            });
            return { success: false, error: String(error) };
        }
    }, [sendMessage, t]);

    const restoreBackup = useCallback(async () => {
        toast.dismiss();
        const oldState = await sendMessage({ type: "EXPORT_DATA" });
        if (!oldState.success) {
            toast.error(t("messages.failedToRestoreBackup"), {
                description: oldState.error,
            });
            return oldState;
        }

        const response = await sendMessage({ type: "RESTORE_BACKUP" });
        if (!response.success) {
            toast.error(t("messages.failedToRestoreBackup"), {
                description: response.error,
            });
            return response;
        }
        toast.success(t("messages.restoredBackup"), {
            duration: 20000,
            action: {
                label: t("common.undo"),
                onClick: async () => {
                    await sendMessage({
                        type: "SET_COLLECTIONS_DANGEROUSLY",
                        payload: oldState.data.data,
                    });
                },
            },
        });
        return response;
    }, [sendMessage, t]);

    const createLocalBackup = useCallback(async () => {
        const response = await sendMessage({ type: "CREATE_LOCAL_BACKUP" });
        if (!response.success) {
            toast.error(t("messages.failedToCreateLocalBackup"), {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage, t]);

    const setAppSetting = useCallback(
        async (payload: Partial<AppSettingType>) => {
            const response = await sendMessage({
                type: "SET_APP_SETTING",
                payload,
            });
            if (!response.success) {
                toast.error(t("messages.failedToSetAppSetting"), {
                    description: response.error,
                });
            }
            return response;
        },
        [sendMessage, t]
    );

    // google drive stuff

    const getGoogleDriveLoginStatus = useCallback(async () => {
        const response = await sendMessage({
            type: "GOOGLE_DRIVE_LOGIN_STATUS",
        });
        if (!response.success) {
            toast.error(t("messages.failedToGetLoginStatus"), {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage, t]);

    const loginGoogleDrive = useCallback(async () => {
        const response = await sendMessage({ type: "LOGIN_GOOGLE_DRIVE" });
        if (!response.success) {
            toast.error(t("messages.failedToLogin"), {
                description: response.error,
            });
        } else {
            toast.success(t("messages.loggedInGoogleDrive"));
        }
        return response;
    }, [sendMessage, t]);

    const logoutGoogleDrive = useCallback(async () => {
        const response = await sendMessage({ type: "LOGOUT_GOOGLE_DRIVE" });
        if (!response.success) {
            toast.error(t("messages.failedToLogout"), {
                description: response.error,
            });
        } else {
            toast.success(t("messages.loggedOutGoogleDrive"));
        }
        return response;
    }, [sendMessage, t]);

    const getGoogleDriveUserInfo = useCallback(async () => {
        const response = await sendMessage({ type: "GOOGLE_DRIVE_USER_INFO" });
        if (!response.success) {
            toast.error(t("messages.failedToGetUserInfo"), {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage, t]);

    const googleDriveSyncNow = useCallback(async () => {
        const response = await sendMessage({ type: "GOOGLE_DRIVE_SYNC_NOW" });
        if (!response.success) {
            toast.error(t("messages.failedToSyncNow"), {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage, t]);

    const getGoogleDriveSyncState = useCallback(async () => {
        const response = await sendMessage({
            type: "GET_GOOGLE_DRIVE_SYNC_STATE",
        });
        if (!response.success) {
            toast.error(t("messages.failedToGetSyncState"), {
                description: response.error,
            });
        }
        return response;
    }, [sendMessage, t]);

    const deleteAllLocalCollectionsData = useCallback(async () => {
        const response = await sendMessage({
            type: "DELETE_ALL_LOCAL_COLLECTIONS_DATA",
        });
        if (!response.success) {
            toast.error(t("messages.failedToDeleteAllLocal"), {
                description: response.error,
            });
        } else {
            toast.success(t("messages.deletedAllLocal"));
        }
        return response;
    }, [sendMessage, t]);
    const deleteAllGDriveSyncedCollectionData = useCallback(async () => {
        const response = await sendMessage({
            type: "DELETE_ALL_GDRIVE_SYCNED_COLLECTION_DATA",
        });
        if (!response.success) {
            toast.error(t("messages.failedToDeleteAllGDrive"), {
                description: response.error,
            });
        } else {
            toast.success(t("messages.deletedAllGDrive"));
        }
        return response;
    }, [sendMessage, t]);
    return (
        <CollectionOperationsContext.Provider
            value={{
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
            }}
        >
            {children}
        </CollectionOperationsContext.Provider>
    );
};
