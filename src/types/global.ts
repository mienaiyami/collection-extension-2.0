import browser from "webextension-polyfill";
import {
    appSettingSchema,
    collectionItemSchema,
    collectionSchema,
    deletedCollectionItemSchema,
    syncDataSchema,
} from "../utils";
import { z } from "zod";

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
export type Assert<T extends true> = T;

declare global {
    type UUID = ReturnType<Window["crypto"]["randomUUID"]>;
    type CollectionItem = z.infer<typeof collectionItemSchema>;
    type Collection = z.infer<typeof collectionSchema>;
    /** applies to both `Collection` and `CollectionItem` */
    type DeletedCollection = z.infer<typeof deletedCollectionItemSchema>;
    type SyncData = z.infer<typeof syncDataSchema>;
    type SyncState = {
        status: "synced" | "syncing" | "unsynced" | "error" | "not-authenticated";
        lastSynced: number | null;
        error?: string;
    };
    type GoogleDriveUserData = {
        displayName: string;
        email: string;
        imageUrl: string;
    };
    interface Window {
        wait: (ms: number) => Promise<unknown>;
        isSidePanel: boolean;
        shiftKeyHeld: boolean;
        browser: typeof browser;
        cloneJSON: <T>(obj: T) => T;
        formatCopyData: (
            format: string,
            data: CollectionItem | CollectionItem[],
            collectionName: string
        ) => string;
    }
    type AppSettingType = z.infer<typeof appSettingSchema>;
}

export {};
