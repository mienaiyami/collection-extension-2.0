// const menu = [{
//     id:"collection-add-URL",action(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab | undefined){
//         console.log(info, tab?.url);
//     },
//     title:"Add page to Collection"
// }]

//! problem here, submenu should contain all collections name

// const subMenu1 = [{

// }]

// chrome.runtime.onInstalled.addListener(async () => {
//     menu.forEach(e=>{

//         chrome.contextMenus.create({
//             id: e.id,
//             title: e.title,
//             type: "radio",
//             contexts: ["all"],
//             // parentId:
//         });
//     })
//     chrome.contextMenus.onClicked.addListener((info, tab) => {
//         console.log(info, tab?.url);
//     });
// });

import browser from "webextension-polyfill";

const backup = () =>
    browser.storage.local.get("collectionData").then(({ collectionData }) => {
        if (collectionData)
            browser.storage.local.set({ backup: collectionData }).then(() => {
                browser.storage.local.set({
                    lastBackup: new Date().toJSON(),
                });
            });
    });

browser.runtime.onInstalled.addListener((e) => {
    if (e.reason === "update") {
        browser.tabs.create({
            active: true,
            url: "https://github.com/mienaiyami/collection-extension-2.0/blob/main/CHANGELOG.MD",
        });
    }
    browser.alarms.create("backup", {
        delayInMinutes: 10,
        periodInMinutes: 10,
    });
});

browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "backup") {
        //todo test
        browser.storage.local.get("lastBackup").then(({ lastBackup }) => {
            if (lastBackup && typeof lastBackup === "string") {
                const last = new Date(lastBackup);
                const now = new Date();
                if (now.getTime() - last.getTime() >= 1000 * 60 * 60 * 6) {
                    console.log("creating backup...");
                    backup();
                }
            }
        });
    }
});

// browser keyboard shortcuts
browser.commands.onCommand.addListener((command) => {
    if (command === "add-current-tab-to-active-collection") {
        //todo later do all collection storing function in background.ts
        browser.runtime
            .sendMessage({
                type: "add-current-tab-to-active-collection",
            })
            .catch(console.error);
    }
});
