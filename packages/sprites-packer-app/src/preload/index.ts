import { contextBridge } from "electron";
import { readdir, access, constants, readFile } from "node:fs/promises";
import { join } from "path";

export async function getImagesInDrectory(dirPath: string) {
    const result: { name: string; imageDataBase64: string; filePath: string }[] = [];
    const validExtensions = ["png"];
    if (await pathExist(dirPath)) {
        const files = await readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                continue;
            }
            if (validExtensions.some((ext) => file.name.endsWith(ext))) {
                const filePath = join(dirPath, file.name);
                const fileData = await readFile(filePath);
                result.push({
                    imageDataBase64: `data:image/png;base64,${fileData.toString("base64")}`,
                    name: file.name,
                    filePath: join(dirPath, file.name),
                });
            }
        }
    }

    return result;
}

export async function pathExist(filePath: string): Promise<boolean> {
    try {
        await access(filePath, constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

export type SpritesPackerApi = {
    hello: () => void;
    getImagesInDirectory: () => Promise<{ imageDataBase64: string; name: string; filePath: string }[]>;
};
const API: SpritesPackerApi = {
    hello: () => console.log("Hello from Electron"),
    getImagesInDirectory: () => {
        return getImagesInDrectory("/Users/piercarlo.imparato/Developer/Personal/sprites-packer/media/symbols");
    },
};

contextBridge.exposeInMainWorld("SpritesPackerApi", API);
