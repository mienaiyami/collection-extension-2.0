import browser from "webextension-polyfill";

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
    }
}
export {};
