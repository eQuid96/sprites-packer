import { MaxRectsPacker } from "maxrects-packer";
import sharp from "sharp";
import { getImageSize, isTrimmed, type ImageData } from "./images";
import { resolve, join } from "path";
import fs from "node:fs/promises";
import { basisCompress } from "./basis-compression";

type AtlasSprite = {
    width: number;
    height: number;
    x: number;
    y: number;
    rot: boolean;
    imageData: ImageData;
};

type AtlasSprites = {
    [key: string]: {
        frame: { x: number; y: number; w: number; h: number };
        rotated: boolean;
        trimmed: boolean;
        spriteSourceSize: { x: number; y: number; w: number; h: number };
        sourceSize: { w: number; h: number };
    };
};

export const SupportedTextureFormats = ["png", "webp", "basis"] as const;
export type TextureFormats = (typeof SupportedTextureFormats)[number];

export const ErrorTextureFormatNotSupported: Error = new Error(
    `Texture format not supported. currently we support only ${SupportedTextureFormats.join(", ")}`
);

export type AtlasOptions = {
    maxWidth: number;
    maxHeight: number;
    padding: number;
    trim: boolean;
    outputPath: string;
    atlasName: string;
    textureFormat: TextureFormats;
};

export async function createAtlas(images: ImageData[], options: AtlasOptions) {
    options.maxWidth = Math.min(options.maxWidth, 4096);
    options.maxHeight = Math.min(options.maxHeight, 4096);

    const packer = new MaxRectsPacker<AtlasSprite>(options.maxWidth, options.maxHeight, options.padding, {
        smart: true,
        pot: true,
        square: false,
        allowRotation: true,
        tag: false,
    });

    if (options.trim) {
        // trimm all images
        for (const img of images) {
            const trimmedData = await sharp(img.buffer).trim().toBuffer();
            img.buffer = trimmedData;
            const trimmedSize = await getImageSize(trimmedData);
            img.trimmedWidth = trimmedSize.width;
            img.trimmedHeight = trimmedSize.height;
        }
    }

    const packerData: AtlasSprite[] = images.map((data) => {
        const width = options.trim ? data.trimmedWidth : data.originalWidth;
        const height = options.trim ? data.trimmedHeight : data.originalHeight;
        return {
            width: width ?? 0,
            height: height ?? 0,
            x: 0,
            y: 0,
            rot: false,
            imageData: data,
        };
    });

    packer.addArray(packerData);

    for (let i = 0; i < packer.bins.length; i++) {
        const bin = packer.bins[i];
        const imagesToPack: { input: Buffer; top: number; left: number }[] = [];
        const sprites: AtlasSprites = {};
        for (const rect of bin.rects) {
            if (rect.rot) {
                //TODO: when a sprite is rotated width and height changes, check if we need to update them.
                rect.imageData.buffer = await sharp(rect.imageData.buffer).rotate(90).toBuffer();
            }
            imagesToPack.push({
                input: rect.imageData.buffer,
                top: rect.y,
                left: rect.x,
            });

            const sourceSize = { x: 0, y: 0, w: rect.width, h: rect.height };
            if (isTrimmed(rect.imageData)) {
                sourceSize.x = Math.floor((rect.imageData.originalWidth - rect.width) * 0.5);
                sourceSize.y = Math.floor((rect.imageData.originalHeight - rect.height) * 0.5);
            }

            sprites[rect.imageData.name] = {
                frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
                rotated: rect.rot,
                trimmed: isTrimmed(rect.imageData),
                spriteSourceSize: sourceSize,
                sourceSize: { w: rect.imageData.originalWidth, h: rect.imageData.originalHeight },
            };
        }

        const atlasName = `${options.atlasName}_atlas-${i}`;
        const atlasTextureName = `${atlasName}.${options.textureFormat}`;
        const atlasConfigName = `${atlasName}.json`;
        let atlas = sharp({
            create: {
                width: bin.width,
                height: bin.height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
        }).composite(imagesToPack);

        switch (options.textureFormat) {
            case "webp":
                await saveWebpAtlas({ sharpData: atlas, atlasTextureName, outPutDirectory: options.outputPath });
                break;
            case "png":
                await savePngAtlas({ sharpData: atlas, atlasTextureName, outPutDirectory: options.outputPath });
                break;
            case "basis":
                await saveBasisAtlas({ sharpData: atlas, atlasTextureName, outPutDirectory: options.outputPath });
                break;
            default:
                const _: never = options.textureFormat;
                return _;
        }

        console.log(`New Atlas: ${atlasTextureName} - width: ${bin.width} height: ${bin.height}`);
        const atlasConfigFile = {
            frames: {
                ...sprites,
            },
            meta: {
                app: "sprites-packer",
                image: atlasTextureName,
                scale: 1,
                format: "RGBA8888",
                size: { w: bin.width, h: bin.height },
            },
        };

        await fs.writeFile(resolve(options.outputPath, atlasConfigName), JSON.stringify(atlasConfigFile));
    }
}

async function savePngAtlas(options: { sharpData: sharp.Sharp; atlasTextureName: string; outPutDirectory: string }) {
    const outPutPath = resolve(options.outPutDirectory, options.atlasTextureName);
    return await options.sharpData.png().toFile(outPutPath);
}

async function saveBasisAtlas(options: { sharpData: sharp.Sharp; atlasTextureName: string; outPutDirectory: string }) {
    //create a temporary dir for saving png atlas
    const tmpDirPath = await fs.mkdtemp(join(options.outPutDirectory, "sprite-packer-"));
    const tmpPngTexturePath = resolve(tmpDirPath, "sprite-packer-tmp.png");
    await options.sharpData.png().toFile(tmpPngTexturePath);
    const finalOutputPath = resolve(options.outPutDirectory, options.atlasTextureName);
    const isCompressionDone = await basisCompress({
        inputFilePath: tmpPngTexturePath,
        outputFilePath: finalOutputPath,
    });
    //delete temporary directory and temporary texture
    await fs.rm(tmpDirPath, { recursive: true });
    return isCompressionDone;
}

async function saveWebpAtlas(options: { sharpData: sharp.Sharp; atlasTextureName: string; outPutDirectory: string }) {
    const outPutPath = resolve(options.outPutDirectory, options.atlasTextureName);
    return await options.sharpData.webp().toFile(outPutPath);
}
