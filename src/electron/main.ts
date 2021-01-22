import {app, BrowserWindow, shell} from "electron"
import contextMenu from "electron-context-menu"
declare const MAIN_WINDOW_WEBPACK_ENTRY: any

if (require("electron-squirrel-startup")) {
	app.quit()
}

// TODO add emph, strong, link etc etc
contextMenu({
	prepend: (defaultActions, params, browserWindow) => [
		// {
		// 	label: "Rainbow",
		// 	// Only show it when right-clicking images
		// 	visible: params.mediaType === "image",
		// },
		{
			label: "Search DuckDuckGo for “{selection}”",
			// Only show it when right-clicking text
			visible: params.selectionText.trim().length > 0,
			click: () => {
				shell.openExternal(
					`https://duckduckgo.com/?q=${encodeURIComponent(
						params.selectionText
					)}`
				)
			},
		},
	],
	showSearchWithGoogle: false,
	showSaveImage: true,
})

const createWindow = (): void => {
	const mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			nodeIntegration: true,
			spellcheck: true,
		},
	})

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

	// Open the DevTools.
	mainWindow.webContents.openDevTools()
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
