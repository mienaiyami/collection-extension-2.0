import browser from "webextension-polyfill";
window.isSidePanel = window.location.href.includes("side_panel.html");
window.isSidePanel && document.body.classList.add("sidePanel");

window.browser = browser;
window.wait = (ms: number) =>
    new Promise((res) => {
        setTimeout(res, ms);
    });
export const getImgFromTab = (tab: browser.Tabs.Tab): Promise<string> => {
    if (tab.id && !(tab.url && /(chrome|edge|brave):\/\//gi.test(tab.url)))
        return window.browser.scripting
            .executeScript({
                target: {
                    tabId: tab.id,
                },
                func: () => {
                    return (
                        (
                            document.querySelector(
                                'head > meta[property="og:image"]'
                            ) ||
                            document.querySelector(
                                'head > meta[name="og:image"]'
                            )
                        )?.getAttribute("content") || ""
                    );
                },
            })
            .then((e) => {
                if (e && e[0].result) return e[0].result as string;
                if (tab.active)
                    return window.browser.tabs.captureVisibleTab().then((e) => {
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
                            img.src = e;
                        });
                    });
                else return tab.favIconUrl || "";
            });
    else
        return new Promise((res, rej) => {
            // rej();
            res("");
        });
};
