chrome.storage.local.get(["lastLoadedTime", "facebookTime", "youtubeTime"]).then(async res => {
    if (!res.lastLoadedTime) {
        await chrome.storage.local.set({ lastLoadedTime: Date.now() });
    }
    if (!res.facebookTime) {
        await chrome.storage.local.set({ facebookTime: 0 });
    }
    if (!res.youtubeTime) {
        await chrome.storage.local.set({ youtubeTime: 0 });
    }
});

const checkValidURL = url => {
    if (!/^http/.test(url)) {
        return false;
    }

    if (url.includes("https://www.facebook.com") || url.includes("https://www.youtube.com")) {
        return true;
    }

    return false;
};

const getSiteInstance = url => {
    return new Promise(async resolve => {
        const tabs = await chrome.tabs.query({});
        resolve(tabs.filter(tab => tab.url.includes(new URL(url).hostname)).length);
    });
};

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.sendMessage(activeInfo.tabId, { text: "u there content.js?" }, msg => {
        msg = msg || {};

        if (msg.status !== "yes") {
            chrome.tabs.get(activeInfo.tabId, tab => {
                if (checkValidURL(tab.url)) {
                    chrome.scripting.executeScript({
                        target: { tabId: activeInfo.tabId },
                        files: ["content.js"]
                    }).then(() => {
                        console.log("INJECTED THE FOREGROUND SCRIPT.");
                    })
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.tabs.sendMessage(tabId, { text: "u there content.js?" }, res => {
        res = res || {};

        if (res.status !== "yes" && changeInfo.status === "complete" && checkValidURL(tab.url)) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            }).then(() => {
                console.log("INJECTED THE FOREGROUND SCRIPT.");
            })
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.requestInjectedCount) {
        new Promise(async resolve => {
            const tabs = await chrome.tabs.query({});
            let count = 0;

            for (const tab of tabs) {
                if (new URL(tab.url).hostname === new URL(request.url).hostname) {
                    await new Promise(resolve => {
                        chrome.tabs.sendMessage(tab.id, { text: "u there content.js?" }, res => {
                            res = res || {};

                            if (res.status === "yes") {
                                count++;
                            }

                            resolve();
                        });
                    });
                }
            }

            resolve(count);
        }).then(res => { sendResponse({ injectedCount: res }); });

        return true;
    }
});

setInterval(() => {
    chrome.storage.local.get(["lastLoadedTime"]).then(async res => {
        const now = Date.now();

        if (new Date(now).getDay() !== new Date(res.lastLoadedTime).getDay()) {
            let a = false, b = false;

            const facebookInstance = await getSiteInstance("https://www.facebook.com");
            const youtubeInstance = await getSiteInstance("https://www.youtube.com");

            if (facebookInstance === 0) {
                a = true;
                await chrome.storage.local.set({ facebookTime: 0 });
            }

            if (youtubeInstance === 0) {
                b = true;
                await chrome.storage.local.set({ youtubeTime: 0 });
            }

            if (a && b) {
                await chrome.storage.local.set({ popupColor: "white" });
                await chrome.storage.local.set({ fontColor: "#FF5E00" });
            }

            await chrome.storage.local.set({ lastLoadedTime: now });
            chrome.runtime.sendMessage({ updatePopup: true, all: true });
        }
    });
}, 1000);
