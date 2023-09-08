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

// backup

chrome.runtime.onInstalled.addListener(() => {
    setInterval(() => {
        chrome.storage.local
            .get("collectionData")
            .then(({ collectionData }) => {
                if (collectionData)
                    chrome.storage.local
                        .set({ backup: collectionData })
                        .then(() => {
                            chrome.storage.local.set({
                                lastBackup: new Date().toJSON(),
                            });
                        });
            });
    }, 1000 * 60 * 60 * 6);
});
