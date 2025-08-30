import browser from "webextension-polyfill";
import { z } from "zod";

export const isBackgroundScript = (): boolean => {
    // type of window is defined in firefox background script
    if (typeof window === "undefined") return true;
    const backgroundScript = browser.extension?.getBackgroundPage?.();
    return window === backgroundScript;
};
export const backgroundOnlyCode = () => {
    if (!isBackgroundScript())
        throw new Error("This function can only be called in the background script.");
};
export const frontOnlyCode = () => {
    if (isBackgroundScript())
        throw new Error("This function can only be called in the front script.");
};

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

type CopyDataFormatArgs = {
    data: CollectionItem;
    i?: number;
    total?: number;
    collectionName?: string;
};
export const COPY_DATA_FORMAT = {
    "{{i}}": (args: CopyDataFormatArgs): string => String(args.i ?? ""),
    "{{total}}": (args: CopyDataFormatArgs): string => String(args.total ?? ""),
    "{{collectionName}}": (args: CopyDataFormatArgs): string => String(args.collectionName ?? ""),
    "{{id}}": (args: CopyDataFormatArgs): string => args.data.id,
    "{{title}}": (args: CopyDataFormatArgs): string => args.data.title,
    "{{url}}": (args: CopyDataFormatArgs): string => args.data.url,
    "{{img}}": (args: CopyDataFormatArgs): string => args.data.img,
    "{{dateCreated}}": (args: CopyDataFormatArgs): string =>
        new Date(args.data.createdAt).toISOString(),
    "{{dateUpdated}}": (args: CopyDataFormatArgs): string =>
        new Date(args.data.orderUpdatedAt).toISOString(),
} as const;
Object.freeze(COPY_DATA_FORMAT);

// need this coz `window` is not defined in the background script
if (!isBackgroundScript()) {
    self.isSidePanel = window?.location.href.includes("side_panel.html");
    if (self.isSidePanel) document.body.classList.add("sidePanel");

    self.browser = browser;
    self.wait = wait;
    self.cloneJSON = (obj) => JSON.parse(JSON.stringify(obj));
    self.formatCopyData = (
        format: string,
        data: CollectionItem | CollectionItem[],
        collectionName: string
    ) => {
        // biome-ignore lint/style/noParameterAssign: <explanation>
        if (!format) format = "{{url}}";
        const formatData = (d: CollectionItem, i?: number) => {
            let formatted = format;
            Object.entries(COPY_DATA_FORMAT).forEach(([key, value]) => {
                formatted = formatted.replaceAll(
                    key,
                    value({
                        data: d,
                        i,
                        total: Array.isArray(data) ? data.length : undefined,
                        collectionName,
                    })
                );
            });
            return formatted;
        };
        if (Array.isArray(data)) {
            return data.map((e, i) => formatData(e, i + 1)).join("\n");
        }
        return formatData(data);
    };
}
export const getReaderProgressFromResponse_JSON = async <T = unknown>(
    response: Response,
    onProgress?: boolean | ((receivedLength: number, totalLength: number) => void),
    abortSignal?: AbortSignal
): Promise<T> => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");
    let receivedLength = 0;
    const totalLength = Number.parseInt(response.headers.get("content-length") ?? "0");
    const chunks: Uint8Array[] = [];
    console.group("Downloading ", response.url);
    while (true) {
        if (abortSignal?.aborted) throw new Error(abortSignal.reason || "Aborted");
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        if (typeof onProgress === "function") onProgress(receivedLength, totalLength);
        else if (onProgress) console.log(`Downloaded: ${(receivedLength / 1024).toFixed(2)} KB`);
    }
    console.groupEnd();
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }
    return JSON.parse(new TextDecoder().decode(chunksAll));
};

const systemUrlPattern = /^(about|chrome|edge|brave|opera|vivaldi|firefox):\/\//i;
export const getImgFromTab = async (tab: browser.Tabs.Tab): Promise<string> => {
    if (!tab.id || (tab.url && systemUrlPattern.test(tab.url))) return "";
    try {
        const result = await browser.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            func: () => {
                const imageUrl =
                    (
                        document.querySelector('head > meta[property="og:image"]') ||
                        document.querySelector('head > meta[name="og:image"]') ||
                        document.querySelector('head > meta[property="twitter:image"]') ||
                        document.querySelector('head > meta[name="twitter:image"]') ||
                        document.querySelector('head > meta[itemprop="image"]')
                    )?.getAttribute("content") || "";
                if (imageUrl.startsWith("/")) return location.origin + imageUrl;
                return imageUrl;
            },
        });
        if (result[0]?.result) return result[0].result as string;
        if (!browser.tabs.captureTab && !tab.active) return tab.favIconUrl || "";

        const capture =
            (await browser.tabs.captureTab?.(tab.id)) || (await browser.tabs.captureVisibleTab());
        const canvas = new OffscreenCanvas(128, 128);
        const w = tab.width || 128;
        const h = tab.height || 128;
        const ratio = w / h;
        const ctx = canvas.getContext("2d");
        const originalBlob = await fetch(capture).then((res) => res.blob());
        const imageBitmap = await createImageBitmap(originalBlob);
        ctx?.drawImage(
            imageBitmap,
            w / 2 - w / ratio / 2,
            0,
            w / ratio,
            h,
            0,
            0,
            canvas.width,
            canvas.height
        );
        const blob = await canvas.convertToBlob({
            type: "image/png",
            quality: 0.85,
        });
        if (!blob) return tab.favIconUrl || "";
        return new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.onerror = (e) => {
                console.error(e);
                res(tab.favIconUrl || "");
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(error);
        return "";
    }
};

export const getDataFromTab = async (tab: browser.Tabs.Tab): Promise<CollectionItem> => {
    if (tab.status === "loading") await wait(1000);
    if (tab.status === "loading") await wait(500);
    const img = await Promise.race([
        getImgFromTab(tab),
        wait(500).then(() => tab.favIconUrl || ""),
    ]);
    if (tab.status === "loading") console.warn("Tab didn't load", tab);
    if (!tab.title || !tab.url) console.warn("Unable to get tab title or url.");
    let url = tab.url || tab.pendingUrl || "Unable to get url";
    if (tab.url === "about:blank") url = tab.title || "Unable to get url";
    const date = Date.now();
    return {
        id: crypto.randomUUID(),
        img,
        title: tab.title || `No title${tab.status === "loading" ? " (tab didn't load)" : ""}`,
        url,
        createdAt: date,
        orderUpdatedAt: date,
    };
};

export const appSettingSchema = z
    .object({
        version: z.number().default(1),
        font: z
            .object({
                size: z.number().default(16),
                family: z.string().default("Inter"),
            })
            .default({}),
        copyDataFormat: z.string().default("{{url}}"),
    })
    .strip();
export const initAppSetting = appSettingSchema.parse({});

// version<=v2.4.2: data is on every item, adding createdAt,updatedAt,deleted now;
export const collectionItemSchema = z
    .object({
        title: z.string(),
        url: z.string(),
        img: z.string(),
        id: z.string().uuid() as z.ZodType<UUID>,

        date: z.string().datetime().optional(),
        createdAt: z.number().optional(),
        orderUpdatedAt: z.number().optional(),
    })
    .transform((old) => {
        // number date is faster compared to ISO string
        const date: number = old.date ? new Date(old.date).getTime() : Date.now();
        return {
            title: old.title,
            url: old.url,
            img: old.img,
            id: old.id,
            createdAt: old.createdAt || date,
            orderUpdatedAt: old.orderUpdatedAt || date,
        };
    });
export const collectionSchema = z
    .object({
        id: z.string().uuid() as z.ZodType<UUID>,
        title: z.string(),
        items: z.array(collectionItemSchema),

        date: z.string().datetime().optional(),
        createdAt: z.number().optional(),
        updatedAt: z.number().optional(),
        orderUpdatedAt: z.number().optional(),
    })
    .transform((old) => {
        const date: number = old.date ? new Date(old.date).getTime() : Date.now();
        return {
            id: old.id,
            title: old.title,
            items: old.items,
            createdAt: old.createdAt || date,
            updatedAt: old.updatedAt || date,
            orderUpdatedAt: old.orderUpdatedAt || date,
        };
    });

/** applies to both `Collection` and `CollectionItem` */
export const deletedCollectionItemSchema = z.object({
    id: z.string().uuid() as z.ZodType<UUID>,
    /** is `CollectionItem` */
    isItem: z.boolean().optional(),
    deletedAt: z.number(),
});
export const syncDataSchema = z.object({
    collectionData: z.array(collectionSchema),
    deletedCollectionData: z.array(deletedCollectionItemSchema).transform((old) => {
        // clear items older than 3months
        return old.filter((e) => e.deletedAt > Date.now() - 1000 * 60 * 60 * 24 * 30 * 3);
    }),
    timestamp: z.number(),
});
