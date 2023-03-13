chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.text === "u there content.js?") {
        sendResponse({ status: "yes" });
    }
});

const currentSite = (() => {
    if (window.location.hostname === "www.facebook.com") {
        return "facebook";
    }

    if (window.location.hostname === "www.youtube.com") {
        return "youtube";
    }

    return undefined;
})();
let firstLoadTime = Date.now();
const viewLimit = 120;
let firstLoaded = true;
let initialTime = 0;
let timeElapsed;
let sendData = false;
let sendUpdatePopupColor = true;

setInterval(async () => {
    chrome.runtime.sendMessage({
        requestInjectedCount: true,
        url: window.location.href
    }, res => {
        if (res.injectedCount === 1) {
            sendData = true;
        }
        else if (!sendData) {
            firstLoadTime = Date.now();
        }
    });

    if (!sendData) {
        return;
    }

    if (firstLoaded) {
        const res = await chrome.storage.local.get(["facebookTime", "youtubeTime"]);
        initialTime = currentSite === "facebook" ? res.facebookTime : currentSite === "youtube" ? res.youtubeTime : 0;
        firstLoaded = false;
    }

    timeElapsed = Math.floor(initialTime + (Date.now() - firstLoadTime) / 60000);

    if (timeElapsed >= viewLimit && sendUpdatePopupColor) {
        chrome.storage.local.set({ popupColor: "red" }).then(() => {
            chrome.runtime.sendMessage({
                updatePopup: true,
                updateColor: true
            });

            sendUpdatePopupColor = false;
        });

        alert(`Bạn đã sử dụng ${currentSite} quá 2 tiếng một ngày!`);
    }

    chrome.storage.local.set(
        currentSite === "facebook" ?  { facebookTime: timeElapsed } : currentSite === "youtube" ?  { youtubeTime: timeElapsed } : {}
    ).then(() => {
        chrome.runtime.sendMessage({
            updatePopup: true,
            currentSite: currentSite
        });
    });
}, 1000);
