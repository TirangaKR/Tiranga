require('v8-compile-cache');
const { app, ipcMain } = require('electron');
const path = require('path');

app._name_ = app.getName() + "@" + app.getVersion();
global.console = require("./logger.js")(app._name_);
const Windows = require("./windowManager.js");

app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('enable-features', 'ImplLatencyRecovery,MainLatencyRecovery');

ipcMain.on("log", (e, ...d) => {
  console.log("renderer_log", ...d);
})

ipcMain.on("splash_domloaded", (e) => {
  console.log("Splash DOM loaded")
  Windows.sendTo("splash", "app_info", app._name_);
})

ipcMain.on("splash_exit", () => {
  console.log("Splash exiting, showing game window")
  Windows.showWindow("game");
  Windows.closeWindow("splash");
})

ipcMain.on("splash_update_available", () => {
  console.log("Update available");
  Windows.closeWindow("game");
})

function initClientWindows() {
  Windows.createWindow("game");
  Windows.createWindow("splash", undefined, true);

  Windows.addEventListener("game", "before-input-event", (e, f) => {
    switch (f.key) {
      case "F11":
        e.preventDefault();
        Windows.toggleFullscreen("game");
        break
      case "F6":
        Windows.reload("game");
        e.preventDefault();
        break
      case "Escape":
        Windows.executeJavaScript("game", 'document.exitPointerLock()');
        break
      case "F12":
        e.preventDefault();
        Windows.openDevTools("game");
        break
    }
  })
}

app.whenReady().then(() => {
  console.log("App ready")

  initClientWindows();

  app.on('activate', function () {
    if (Windows._BrowserWindow.getAllWindows().length === 0) initClientWindows();
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})