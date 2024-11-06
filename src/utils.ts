import browser from "webextension-polyfill";
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
            if (tab.status === "loading") await window.wait(1000);
            if (tab.status === "loading") await window.wait(500);
            const img = await Promise.race([
                getImgFromTab(tab),
                window.wait(500).then(() => tab.favIconUrl || ""),
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
