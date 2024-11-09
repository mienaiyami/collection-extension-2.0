import browser from "webextension-polyfill";
import { z } from "zod";

// need this coz `window` is not defined in the background script
if (typeof window !== "undefined") {
    self.isSidePanel =
        window && window.location.href.includes("side_panel.html");
    if (self.isSidePanel) document.body.classList.add("sidePanel");

    self.browser = browser;
    self.wait = (ms: number) =>
        new Promise((res) => {
            setTimeout(res, ms);
        });
    self.cloneJSON = (obj) => JSON.parse(JSON.stringify(obj));
    self.formatCopyData = (
        format: string,
        data: CollectionItem | CollectionItem[]
    ) => {
        if (!format) format = "{{url}}";
        const formatData = (data: CollectionItem, i?: number) => {
            return format
                .replace(/{{id}}/g, data.id)
                .replace(/{{title}}/g, data.title)
                .replace(/{{url}}/g, data.url)
                .replace(/{{img}}/g, data.img)
                .replace(/{{date}}/g, data.date)
                .replace(/{{i}}/g, String(i));
        };
        if (data instanceof Array) {
            return data.map((e, i) => formatData(e, i + 1)).join("\n");
        }
        return formatData(data);
    };
}
const systemUrlPattern =
    /^(about|chrome|edge|brave|opera|vivaldi|firefox):\/\//i;
export const getImgFromTab = async (tab: browser.Tabs.Tab): Promise<string> => {
    if (!tab.id || (tab.url && systemUrlPattern.test(tab.url))) return "";
    try {
        const result = await browser.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            func: () => {
                return (
                    (
                        document.querySelector(
                            'head > meta[property="og:image"]'
                        ) ||
                        document.querySelector('head > meta[name="og:image"]')
                    )?.getAttribute("content") || ""
                );
            },
        });
        if (result && result[0].result) return result[0].result as string;
        if (!browser.tabs.captureTab! && !tab.active)
            return tab.favIconUrl || "";

        const capture =
            (await browser.tabs.captureTab?.(tab.id)) ||
            (await browser.tabs.captureVisibleTab());
        return new Promise((res: (value: string) => void) => {
            const canvas = document.createElement("canvas");
            const w = tab.width || 128,
                h = tab.height || 128;
            const ratio = w / h;
            canvas.height = 128;
            canvas.width = 128;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                ctx?.drawImage(
                    img,
                    w / 2 - w / ratio / 2,
                    0,
                    w / ratio,
                    h,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                res(canvas.toDataURL());
            };
            img.src = capture;
        });
    } catch (error) {
        console.error(error);
        return "";
    }
};

export const getAllTabsData = async () => {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const date = new Date();
    const tabsData: CollectionItem[] = await Promise.all(
        tabs.map(async (tab) => {
            if (tab.status === "loading") await self.wait(1000);
            if (tab.status === "loading") await self.wait(500);
            const img = await Promise.race([
                getImgFromTab(tab),
                self.wait(500).then(() => tab.favIconUrl || ""),
            ]);
            if (tab.status === "loading") console.warn("Tab didn't load", tab);
            if (!tab.title || !tab.url)
                console.warn("Unable to get tab title or url.");
            let url = tab.url || tab.pendingUrl || "Unable to get url";
            // this is for firefox only, as it do not have `tab.pendingUrl`
            if (tab.url === "about:blank")
                url = tab.title || "Unable to get url";

            return {
                date: date.toISOString(),
                id: crypto.randomUUID(),
                img,
                title:
                    tab.title ||
                    `No title${
                        tab.status === "loading" ? " (tab didn't load)" : ""
                    }`,
                url,
            };
        })
    );
    return tabsData;
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
