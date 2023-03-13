document.addEventListener("DOMContentLoaded", event => {
    chrome.storage.local.get(["facebookTime", "youtubeTime", "popupColor"]).then(res => {
        document.getElementById("facebookTime").innerText = res.facebookTime;
        document.getElementById("youtubeTime").innerText = res.youtubeTime;
        document.body.style.backgroundColor = res.popupColor;
    })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.updatePopup) {
            chrome.storage.local.get(["facebookTime", "youtubeTime", "popupColor"]).then(res => {
                if (request.all) {
                    document.getElementById("facebookTime").innerText = res.facebookTime;
                    document.getElementById("youtubeTime").innerText = res.youtubeTime;
                    document.body.style.backgroundColor = res.popupColor;
                }

                if (request.currentSite !== undefined) {
                    if (request.currentSite === "facebook") {
                        document.getElementById("facebookTime").innerText = res.facebookTime;
                    }
                    else if (request.currentSite === "youtube") {
                        document.getElementById("youtubeTime").innerText = res.youtubeTime;
                    }
                }

                if (request.updateColor) {
                    document.body.style.backgroundColor = res.popupColor;
                }
            });
        }
    });
}, false);
