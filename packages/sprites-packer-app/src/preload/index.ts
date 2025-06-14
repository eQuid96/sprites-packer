import { contextBridge } from "electron";

export type SpritesPackerApi = {
    hello: () => void;
    test: () => number;
};
const API: SpritesPackerApi = {
    hello: () => console.log("Hello from Electron"),
    test: () => 4,
};

contextBridge.exposeInMainWorld("SpritesPackerApi", API);
