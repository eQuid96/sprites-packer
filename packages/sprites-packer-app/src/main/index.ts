import { app, BrowserWindow } from "electron";
import { join } from "path";

function isDev() {
    return process.env.NODE_ENV === "development";
}
function createWindow(): BrowserWindow {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: join(__dirname, "../preload/index.mjs"),
            sandbox: false,
        },
    });

    if (isDev()) {
        window.webContents.openDevTools();
    }

    return window;
}

app.whenReady().then(() => {
    const window = createWindow();

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (process.env["ELECTRON_RENDERER_URL"]) {
        window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        window.loadFile(join(__dirname, "../renderer/index.html"));
    }
});
