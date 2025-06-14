import type { SpritesPackerApi } from "./index";
declare global {
    interface Window {
        SpritesPackerApi: SpritesPackerApi;
    }
}

export {};
