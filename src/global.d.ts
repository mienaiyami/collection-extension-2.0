import browser from "webextension-polyfill";
import { appSettingSchema } from "./utils";
import { z } from "zod";

declare global {
    type UUID = ReturnType<Window["crypto"]["randomUUID"]>;
    type CollectionItem = {
        title: string;
        url: string;
        img: string;
        id: UUID;
        /**
         * ISO date string
         */
        date: string;
    };
    type Collection = {
        id: UUID;
        title: string;
        items: CollectionItem[];
    };
    interface Window {
        wait: (ms: number) => Promise<unknown>;
        isSidePanel: boolean;
        shiftKeyHeld: boolean;
        browser: typeof browser;
        cloneJSON: <T>(obj: T) => T;
        formatCopyData: (
            format: string,
            data: CollectionItem | CollectionItem[]
        ) => string;
    }
    type AppSettingType = z.infer<typeof appSettingSchema>;
}
export {};
