const { ipcRenderer } = require("electron");
const { checkForUpdates } = require("../../updater.js");

let anim_transform = {
    x: 0,
    y: 0,
    last: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
};

const setupMouseAnim = (front, bg) => {
    window.addEventListener("mousemove", (e) => {
        anim_transform.x += (e.clientX - anim_transform.last.x) / 20;
        anim_transform.y += (e.clientY - anim_transform.last.y) / 20;

        anim_transform.last.x = e.clientX;
        anim_transform.last.y = e.clientY;

        bg.style.transform = `translate(${anim_transform.x}px, ${anim_transform.y}px) scale(5)`;
        front.style.transform = `translate(${-anim_transform.x / 5}px, ${-anim_transform.y / 5}px)`;
    });
};

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("splash_domloaded");

    const loadText = document.getElementById("load-text");
    const titleText = document.getElementById("title-text");

    setupMouseAnim(document.getElementById("logoimg"), document.getElementById("logoimg-shadow"));

    ipcRenderer.on("app_info", (e, vinfo) => {
        titleText.innerHTML = vinfo;
        loadText.innerHTML = "Checking for update...";

        checkForUpdates().then(res => {
            let isUpdateAvailable = false;
            try {
                let version = vinfo.split("@").pop();
                if (res && version && res.version && res.version !== version && parseInt(version) < parseInt(res.version)) {
                    loadText.innerHTML = "Update Available";
                    loadText.style.textAlign = "center";
                    isUpdateAvailable = true;
                }
            } catch (error) {
                console.log(error);
                ipcRenderer.send("log", error.message);
            }
            if (!isUpdateAvailable) {
                loadText.innerHTML = "Loading game...";
                setTimeout(() => ipcRenderer.send("splash_exit"), 1e3);
            } else {
                ipcRenderer.send("splash_update_available");
            }
        }).catch((err) => {
            ipcRenderer.send("log", "Update checker error:", err);
            loadText.style.textAlign = "center";
            loadText.innerHTML = "Error while checking for updates.";
            setTimeout(() => ipcRenderer.send("splash_exit"), 3e3);
        })
    })
})