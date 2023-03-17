document.addEventListener("DOMContentLoaded", event => {
    chrome.storage.local.get(["facebookTime", "youtubeTime", "popupColor", "fontColor"]).then(res => {
        document.getElementById("facebookTime").innerText = res.facebookTime;
        document.getElementById("youtubeTime").innerText = res.youtubeTime;
        document.body.style.backgroundColor = res.popupColor;
        document.body.style.color = res.fontColor;
    })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.updatePopup) {
            chrome.storage.local.get(["facebookTime", "youtubeTime", "popupColor", "fontColor"]).then(res => {
                if (request.all) {
                    document.getElementById("facebookTime").innerText = res.facebookTime;
                    document.getElementById("youtubeTime").innerText = res.youtubeTime;
                    document.body.style.backgroundColor = res.popupColor;
                    document.body.style.color = res.fontColor;
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
                    document.body.style.color = res.fontColor;
                }
            });
        }
    });
}, false);
