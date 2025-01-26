import browser from "webextension-polyfill";
import { appSettingSchema, collectionItemSchema, collectionSchema } from "../utils";
import { z } from "zod";

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
export type Assert<T extends true> = T;

declare global {
    type UUID = ReturnType<Window["crypto"]["randomUUID"]>;
    type CollectionItem = z.infer<typeof collectionItemSchema>;
    type Collection = z.infer<typeof collectionSchema>;
    interface Window {
        wait: (ms: number) => Promise<unknown>;
        isSidePanel: boolean;
        shiftKeyHeld: boolean;
        browser: typeof browser;
        cloneJSON: <T>(obj: T) => T;
        formatCopyData: (format: string, data: CollectionItem | CollectionItem[]) => string;
    }
    type AppSettingType = z.infer<typeof appSettingSchema>;
}

export {};
