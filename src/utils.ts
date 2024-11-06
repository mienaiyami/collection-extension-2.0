import browser from "webextension-polyfill";
import { toast } from "./components/ui/use-toast";
window.isSidePanel = window.location.href.includes("side_panel.html");
window.isSidePanel && document.body.classList.add("sidePanel");

window.browser = browser;
window.wait = (ms: number) =>
    new Promise((res) => {
        setTimeout(res, ms);
    });

const systemUrlPattern =
    /^(about|chrome|edge|brave|opera|vivaldi|firefox):\/\//i;
export const getImgFromTab = async (tab: browser.Tabs.Tab): Promise<string> => {
    if (!tab.id || (tab.url && systemUrlPattern.test(tab.url))) return "";
    try {
        const result = await window.browser.scripting.executeScript({
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
        if (!window.browser.tabs.captureTab! && !tab.active)
            return tab.favIconUrl || "";

        const capture =
            (await window.browser.tabs.captureTab?.(tab.id)) ||
            (await window.browser.tabs.captureVisibleTab());
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
    const tabs = await window.browser.tabs.query({ currentWindow: true });
    const date = new Date();
    const tabsData: CollectionItem[] = await Promise.all(
        tabs.map(async (tab) => {
            const img = await Promise.race([
                getImgFromTab(tab),
                window.wait(500).then(() => tab.favIconUrl || ""),
            ]);
            return {
                date: date.toISOString(),
                id: crypto.randomUUID(),
                img,
                title: tab.title || "title",
                url: tab.url || "",
            };
        })
    );
    return tabsData;
};
