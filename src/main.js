require('v8-compile-cache');
const { app, ipcMain } = require('electron');

// override console to include project name and version before every log
app._name_ = app.getName() + "@" + app.getVersion();
global.console = (function getLogger(prefix) {
	const _console = {};
	for (const k of Object.entries(console)) {
		_console[k[0]] = (...args) => {
			const addB4 = prefix + " > ";
			if (args.length > 0) {
				args[0] = addB4 + args[0];
			} else {
				args = [addB4];
			}
			return k[1](...args);
		}
	}
	return _console;
})(app._name_);


const settings = require("./managers/settings.js")(app);
require("./cmdlineSwitches.js")(app, settings);
const client_files = require("./managers/files.js")(app, settings);
const Windows = require("./managers/windows.js");

ipcMain.on("log", (e, ...t) => {
	console.log("renderer_log", ...t);
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
	console.log("App ready");

	initClientWindows();

	app.on('activate', function () {
		if (Windows._BrowserWindow.getAllWindows().length === 0) initClientWindows();
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
})