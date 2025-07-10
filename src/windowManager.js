const { BrowserWindow } = require('electron');
const path = require('path');

const wins_info = {
    d4ltIcon: path.join(__dirname, "../build/icon.ico"),
    splash: {
        file: path.join(__dirname, "/windows/splash/splash.html"),
        preload: path.join(__dirname, "/windows/splash/splashload.js"),
        options: {
            width: 670,
            height: 370,
            frame: false
        },
        webPreferences: {
            contextIsolation: false,
            webSecurity: true,
            nodeIntegration: false
        }
    },
    game: {
        url: "https://krunker.io",
        preload: path.join(__dirname, "/windows/game/preload.js"),
        options: {
            width: 1280,
            height: 720
        },
        webPreferences: {
            contextIsolation: false,
            webSecurity: true,
            nodeIntegration: false
        }
    }
};

module.exports = new (class windowManager {
    _BrowserWindow = BrowserWindow;

    winsCreated = {};

    isCreated = (key) => this.winsCreated[key] ? true : false;

    createWindow = (key, onReady = () => { }, showOnReady = false) => {
        if (!wins_info[key]) {
            console.error("windowManager (error) > createWindow called with invalid key parameter:", key);
            return;
        }
        if (this.winsCreated[key]) {
            console.log("windowManager > createWindow called with winsCreated key: ", key, ". Destroying & Re-Creating window.");
            this.winsCreated[key].destroy();
        } else {
            console.log("windowManager > Creating window:", key);
        }

        const info = wins_info[key];

        const win = new BrowserWindow({
            ...(info.options || {}),
            icon: info.icon || wins_info.d4ltIcon,
            show: false,
            webPreferences: {
                webSecurity: true,
                contextIsolation: false,
                ...(info.webPreferences || {}),
                preload: info.preload
            }
        });

        function loadWindowURLorFILE() {
            if (info.file) {
                win.loadFile(info.file);
            } else if (info.url) {
                win.loadURL(info.url);
            }
        };
        loadWindowURLorFILE();

        if (!info.keepMenuBar) {
            win.removeMenu();
        }

        win.once("ready-to-show", () => {
            if (showOnReady) {
                win.show();
            }
            this.winsCreated[key].readyToShow = true;
            onReady(() => win.show());
        })

        this.winsCreated[key] = {
            send: (...e) => win.webContents.send(...e),
            readyToShow: false,
            show: () => win.show(),
            reload: loadWindowURLorFILE,
            addEventListener: (...e) => win.webContents.on(...e),
            executeJavaScript: (...e) => win.webContents.executeJavaScript(...e),
            toggleFullscreen: () => win.setFullScreen(!win.isFullScreen()),
            openDevTools: () => win.webContents.openDevTools({ mode: "detach" }), 
            destroy: () => {
                win.destroy();
                delete this.winsCreated[key];
            }
        };
    };

    showWindow = (key) => {
        if (this.winsCreated[key]) {
            const showThisWindow = () => {
                if (this.winsCreated[key].readyToShow) {
                    this.winsCreated[key].show();
                } else {
                    setTimeout(showThisWindow, 100);
                }
            }
            showThisWindow();
        } else {
            console.error("windowManager (error) > showWindow called with non-existent window key:", key);
        }
    };

    toggleFullscreen  = (key) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].toggleFullscreen();
        } else {
            console.error("windowManager (error) > toggleFullscreen called with non-existent window key:", key);
        }
    };

    executeJavaScript = (key, ...e) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].executeJavaScript(...e);
        } else {
            console.error("windowManager (error) > toggleFullscreen called with non-existent window key:", key);
        }
    };

    openDevTools  = (key) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].openDevTools();
        } else {
            console.error("windowManager (error) > openDevTools called with non-existent window key:", key);
        }
    };

    reload  = (key) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].reload();
        } else {
            console.error("windowManager (error) > reload called with non-existent window key:", key);
        }
    };

    closeWindow  = (key) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].destroy();
        } else {
            console.error("windowManager (error) > closeWindow called with non-existent window key:", key);
        }
    };

    sendTo = (key, ...e) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].send(...e);
        } else {
            console.error("windowManager (error) > sendTo called with non-existent window key:", key);
        }
    };

    addEventListener = (key, ...e) => {
        if (this.winsCreated[key]) {
            this.winsCreated[key].addEventListener(...e);
        } else {
            console.error("windowManager (error) > addEventListener called with non-existent window key:", key);
        }
    };
})();