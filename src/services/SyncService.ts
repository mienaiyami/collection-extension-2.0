import { getReaderProgressFromResponse_JSON, syncDataSchema } from "@/utils";
import { GoogleAuthService } from "./GoogleAuthService";
import browser from "webextension-polyfill";

export class SyncService {
    private static readonly MAX_RETRIES = 3;
    private static readonly INITIAL_RETRY_DELAY = 1000;

    static readonly SYNC_DEBOUNCE_TIME = 1000 * 60 * 5;
    static readonly SYNC_RECENCY_THRESHOLD = 1000 * 60;
    static readonly SYNC_DATA_FILE_NAME = `collections-sync-data.json`;
    static readonly SYNC_DATA_FOLDER_NAME = `appDataFolder`;

    static syncTimeout: NodeJS.Timeout | null = null;
    private static syncAbortController: AbortController | null = null;

    private static async findSyncDataFile(token: string): Promise<string | null> {
        const response = await fetch(
            //name='${SYNC_DATA_FILE_NAME}' and
            `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=name='${this.SYNC_DATA_FILE_NAME}'`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: this.syncAbortController?.signal,
            }
        );
        const data = await response.json();

        if (!response.ok) {
            console.error(response);
            return null;
            // throw new Error(`Failed to search files: ${response.status} ${response.statusText}`);
        }
        return data.files?.[0]?.id || null;
    }

    static async uploadSyncData(syncData: SyncData): Promise<void> {
        let retryCount = 0;
        while (retryCount < this.MAX_RETRIES) {
            try {
                if (this.syncAbortController?.signal.aborted) {
                    throw new Error(this.syncAbortController.signal.reason);
                }
                const token = await GoogleAuthService.getValidToken(
                    true,
                    this.syncAbortController?.signal
                );
                const fileId = await this.findSyncDataFile(token);

                const metadata = {
                    mimeType: "application/json",
                    fields: "id",
                    ...(!fileId && {
                        name: this.SYNC_DATA_FILE_NAME,
                        parents: [this.SYNC_DATA_FOLDER_NAME],
                    }),
                };
                const body = JSON.stringify(syncData);

                const form = new FormData();
                form.append(
                    "metadata",
                    new Blob([JSON.stringify(metadata)], { type: "application/json" })
                );
                form.append("file", new Blob([body], { type: "application/json" }));

                const url = fileId
                    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
                    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

                const response = await fetch(url, {
                    method: fileId ? "PATCH" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: form,
                    signal: this.syncAbortController?.signal,
                });

                console.log(await response.json());

                if (!response.ok) {
                    console.error(response);
                    throw new Error("Failed to upload syncData to Google Drive");
                }
                console.log("Uploaded SyncData");
                return;
            } catch (error) {
                if (error instanceof Error && error.message.includes("401")) {
                    throw error;
                }
                retryCount++;
                if (retryCount >= this.MAX_RETRIES) {
                    throw error;
                }
                if (error instanceof Error) {
                    if (error.message.includes("The user did not approve access")) {
                        throw error;
                    }
                    if (error.message.includes("Sync Aborted")) {
                        throw error;
                    }
                }
                const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.error(`Error uploading syncData: ${error}. Retrying in ${delay}ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    static async validCollectionData(data: unknown): Promise<SyncData> {
        try {
            return syncDataSchema.parse(data);
        } catch (error) {
            throw new Error("Invalid syncData data", { cause: error });
        }
    }

    /** only returns null when remote not found or remote invalid */
    static async downloadSyncData(): Promise<SyncData | null> {
        let retryCount = 0;
        const notFound = new Error("No syncData found on Google Drive");
        while (retryCount < this.MAX_RETRIES && !this.syncAbortController?.signal.aborted) {
            try {
                const token = await GoogleAuthService.getValidToken(
                    true,
                    this.syncAbortController?.signal
                );
                const fileId = await this.findSyncDataFile(token);

                if (!fileId) {
                    throw notFound;
                }

                const response = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: this.syncAbortController?.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await getReaderProgressFromResponse_JSON(
                    response,
                    undefined,
                    this.syncAbortController?.signal
                );
                try {
                    console.log(
                        "Validating syncData",
                        Intl.NumberFormat().format(new Blob([JSON.stringify(data)]).size / 1024),
                        "KB"
                    );
                    const now = performance.now();
                    const syncData = await this.validCollectionData(data);
                    console.log("Validated syncData", performance.now() - now, "ms");
                    return syncData;
                } catch (error) {
                    console.error("Invalid syncData data", error);
                    return null;
                }
            } catch (error) {
                console.error(error);
                if (error === notFound) {
                    return null;
                }
                retryCount++;
                if (retryCount >= this.MAX_RETRIES || this.syncAbortController?.signal.aborted) {
                    throw error;
                }
                const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.error(`Error downloading syncData: ${error}. Retrying in ${delay}ms`);
                return await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        return null;
    }
    static mergeCollectionItems(
        local: CollectionItem[],
        remote: CollectionItem[],
        deletedMap: Map<UUID, DeletedCollection>
    ): CollectionItem[] {
        const itemMap = new Map<string, CollectionItem>();
        const localMap = new Map(
            local.reduce((acc, item) => {
                if (!deletedMap.get(item.id)) acc.push([item.id, item]);
                return acc;
            }, [] as [UUID, CollectionItem][])
        );
        remote.forEach((remoteItem) => {
            const localItem = localMap.get(remoteItem.id);
            if (!localItem) {
                if (!deletedMap.get(remoteItem.id)) itemMap.set(remoteItem.id, remoteItem);
            } else {
                itemMap.set(remoteItem.id, {
                    ...localItem,
                    ...remoteItem,
                    updatedAt: new Date().getTime(),
                });
            }
        });
        localMap.forEach((localItem) => {
            if (!itemMap.has(localItem.id)) {
                itemMap.set(localItem.id, localItem);
            }
        });
        return Array.from(itemMap.values());
    }
    static mergeCollection(
        local: Collection,
        remote: Collection,
        deletedMap: Map<UUID, DeletedCollection>
    ): Collection {
        if (local.updatedAt > remote.updatedAt) {
            return {
                ...remote,
                ...local,
                items: this.mergeCollectionItems(local.items, remote.items, deletedMap),
                updatedAt: local.updatedAt,
            };
        }
        return {
            ...local,
            ...remote,
            items: this.mergeCollectionItems(local.items, remote.items, deletedMap),
            updatedAt: remote.updatedAt,
        };
    }
    static mergeData(
        localColData: Collection[],
        remoteColData: Collection[],
        localDeleted: DeletedCollection[],
        remoteDeleted: DeletedCollection[]
    ): {
        collectionData: Collection[];
        deletedCollectionData: DeletedCollection[];
    } {
        const collectionMap = new Map<UUID, Collection>();
        const deletedMap = new Map<UUID, DeletedCollection>();
        localDeleted.forEach((deleted) => {
            deletedMap.set(deleted.id, deleted);
        });
        remoteDeleted.forEach((deleted) => {
            deletedMap.set(deleted.id, deleted);
        });
        const localMap = new Map(
            localColData.reduce((acc, col) => {
                if (!deletedMap.has(col.id)) acc.push([col.id, col]);
                return acc;
            }, [] as [UUID, Collection][])
        );
        remoteColData.forEach((remoteCol) => {
            const localCol = localMap.get(remoteCol.id);
            if (!localCol) {
                if (!deletedMap.get(remoteCol.id)) collectionMap.set(remoteCol.id, remoteCol);
            } else {
                collectionMap.set(
                    remoteCol.id,
                    this.mergeCollection(localCol, remoteCol, deletedMap)
                );
            }
        });
        localMap.forEach((localCol) => {
            if (!collectionMap.has(localCol.id)) {
                collectionMap.set(localCol.id, localCol);
            }
        });
        return {
            collectionData: Array.from(collectionMap.values()),
            deletedCollectionData: Array.from(deletedMap.values()),
        };
    }

    //
    //
    static reNewAbortController(): void {
        this.abortSync();
        this.syncAbortController = new AbortController();
        console.log(this.syncAbortController);
    }
    static abortSync(reason?: string): void {
        if (this.syncAbortController) {
            this.syncAbortController.abort(new Error(reason || "Sync aborted"));
            console.log(this.syncAbortController.signal);
            // not removed coz needed in places
            // this.syncAbortController = null;
        }
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null;
        }
    }
    static async setSyncState(
        syncState: SyncState | ((prevState: SyncState) => SyncState)
    ): Promise<void> {
        if (typeof syncState === "function") {
            const original = await this.getSyncState();
            // removing error so don't have to do it in every call
            original.error = undefined;
            await browser.storage.local.set({
                syncState: syncState(original),
            });
        } else {
            await browser.storage.local.set({ syncState });
        }
    }
    static async getSyncState(): Promise<SyncState> {
        const { syncState } = (await browser.storage.local.get("syncState")) as {
            syncState: SyncState;
        };
        if (typeof syncState === "object" && typeof syncState.status !== "undefined")
            return syncState;
        console.log("No syncState found. Setting to unsynced");
        await browser.storage.local.set({ syncState: { status: "unsynced", lastSynced: null } });
        return { status: "unsynced", lastSynced: null };
    }
    static async isSafeToSync(): Promise<{
        isSafe: boolean;
        reason: {
            recentlySynced: boolean;
            syncingInProgress: boolean;
        };
    }> {
        console.log("isSafeToSync");
        const { status, lastSynced } = await this.getSyncState();
        console.log("time since last sync", Date.now() - (lastSynced || 0));
        const reason = {
            syncingInProgress: status === "syncing",
            recentlySynced: !!lastSynced && Date.now() - lastSynced < this.SYNC_RECENCY_THRESHOLD,
        };
        return {
            isSafe: !reason.syncingInProgress && !reason.recentlySynced,
            reason,
        };
    }
    static async syncWithDebounce({
        delay = this.SYNC_DEBOUNCE_TIME,
        rejectIfRecentlySynced = true,
        rejectIfSyncing = true,
    } = {}): Promise<void> {
        const isSafe = await this.isSafeToSync();
        if (rejectIfRecentlySynced && isSafe.reason.recentlySynced) {
            throw new Error("Recently synced. Try again later");
        }
        if (rejectIfSyncing && isSafe.reason.syncingInProgress) {
            throw new Error("Sync in progress. Try again later");
        }
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => this.syncData(), delay);
    }
    static async syncNow(): Promise<void> {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        await this.syncData();
    }
    private static async syncData(): Promise<void> {
        console.group("background:syncData");
        try {
            if (!(await GoogleAuthService.isLoggedIn())) {
                console.log("Not logged in");
                await this.setSyncState({
                    status: "error",
                    lastSynced: null,
                    error: "Not logged in",
                });
                return;
            }
            const syncState = await this.getSyncState();
            if (syncState.status === "syncing") {
                console.log("Already syncing");
                return;
            }

            this.reNewAbortController();

            await this.setSyncState((prev) => ({ ...prev, status: "syncing" }));
            const now = performance.now();
            console.log("Starting sync", performance.now() - now, "ms");
            const remoteData = await this.downloadSyncData();
            if (!remoteData) {
                console.log("No remote data found");
            }
            console.log("Got remote data", performance.now() - now, "ms");
            // its better to get the local data after remote data is fetched
            // so there is less chance of local data changing between the time of fetching remote data and merging
            const timestamp = Date.now();
            const { collectionData = [], deletedCollectionData = [] } =
                (await browser.storage.local.get(["collectionData", "deletedCollectionData"])) as {
                    collectionData: Collection[];
                    deletedCollectionData: DeletedCollection[];
                };
            if (this.syncAbortController?.signal.aborted)
                throw new Error(this.syncAbortController.signal.reason);
            const now2 = performance.now();
            const mergedData = this.mergeData(
                collectionData,
                remoteData?.collectionData || [],
                deletedCollectionData,
                remoteData?.deletedCollectionData || []
            );
            console.log("merge took", performance.now() - now2, "ms");
            // important in case data updated while merging
            await this.uploadSyncData({
                collectionData: mergedData.collectionData,
                deletedCollectionData: mergedData.deletedCollectionData,
                timestamp: timestamp,
            });
            // maybe its better to be called after upload
            // if local is changed while uploading, it will be aborted
            if (this.syncAbortController?.signal.aborted)
                throw new Error(this.syncAbortController.signal.reason);
            console.log({ mergedData });
            // await this.setSyncState({ status: "synced", lastSynced: timestamp });
            // doing this together is better because sync is triggered by changes in local data
            // and listener can check is data was changed with syncSate=synced to ignore syncing again
            const newData: {
                collectionData: Collection[];
                deletedCollectionData: DeletedCollection[];
                syncState: SyncState;
            } = {
                collectionData: mergedData.collectionData,
                deletedCollectionData: mergedData.deletedCollectionData,
                syncState: { status: "synced", lastSynced: timestamp },
            };
            await browser.storage.local.set(newData);
            console.log("Saved merged data", performance.now() - now2, "ms");
            console.log("Synced data", performance.now() - now, "ms");
        } catch (error) {
            console.error(error);
            let errorMessage = "Failed to sync data";
            if (!navigator.onLine) errorMessage = "No internet connection";
            else if (error instanceof Error) {
                if (error === this.syncAbortController?.signal.reason) {
                    errorMessage = "Sync Aborted";
                } else if (error.message.includes("401")) {
                    errorMessage = "Authentication error. Please login again";
                } else if (error.message.includes("Sync Aborted")) {
                    errorMessage = "Sync Aborted";
                } else if (error.message.includes("Failed to fetch")) {
                    if (navigator.onLine) errorMessage = "Failed to get data from Google Drive";
                    else errorMessage = "No internet connection";
                } else {
                    errorMessage = error.message;
                }
            }
            await this.setSyncState((init) => ({
                ...init,
                status: "error",
                error: errorMessage,
            }));
        } finally {
            console.groupEnd();
        }
    }
}
