import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
    main: {
        // vite config options
    },
    preload: {},
    renderer: {
        plugins: [react()],
    },
});
