import path from "path";
import { getImagesInDrectory, pathExist } from "./images";
import { createAtlas, ErrorTextureFormatNotSupported, SupportedTextureFormats, TextureFormats } from "./atlas";
import type { ImageData } from "./images";
import { getImageData } from "./images";
import { mkdir } from "fs/promises";

export type SpritePackerOptions = {
    /**
     * Directory path where source sprite images are located
     */
    inputPath: string;
    /**
     * Directory path where the atlas image and metadata will be saved
     */
    outputPath: string;
    /**
     * Maximum width of the generated atlas in pixels
     */
    maxWidth: number;
    /**
     * Maximum height of the generated atlas in pixels
     */
    maxHeight: number;
    /**
     * Number of pixels to insert between sprites in the atlas
     */
    padding: number;
    /**
     * When true, transparent borders around sprites will be trimmed
     */
    trim: boolean;
    /**
     * Format of the output atlas texture
     * - png: Standard PNG format with transparency support
     * - 'webpg': WebP format with better compression ratios
     * - 'basis': Basis Universal supercompressed GPU texture format
     */
    textureFormat: TextureFormats;
};

/**
 * Packs individual sprite images into a single atlas image.
 *
 * This function processes images from a given input directory, arranges them efficiently into a sprite atlas,
 * and saves the result to the specified output path. It can optionally trim transparent borders and add padding
 * between sprites.
 *
 * @param options - Configuration options for the sprite packing process
 * @param options.maxWidth - Maximum width of the generated atlas in pixels
 * @param options.maxHeight - Maximum height of the generated atlas in pixels
 * @param options.inputPath - Directory path where source sprite images are located
 * @param options.outputPath - Directory path where the atlas image and metadata will be saved
 * @param options.trim - When true, transparent borders around sprites will be trimmed
 * @param options.padding - Number of pixels to insert between sprites in the atlas
 * @param options.textureFormat - png, webp, or basis
 *
 * @throws Will throw an error if the input directory contains no images
 * @throws Will throw an error if the options are invalid
 *
 * @returns Promise that resolves when the atlas generation is complete
 */
export async function spritesPacker(options: SpritePackerOptions) {
    await validateOptions(options);
    const { maxWidth, maxHeight, inputPath, outputPath, trim, padding, textureFormat } = options;

    const outPathExist = await pathExist(outputPath);
    if (!outPathExist) {
        await mkdir(outputPath);
    }

    const images = await getImagesInDrectory(inputPath);
    if (images.length <= 0) {
        throw new Error(`No images found in the input directory: ${inputPath}`);
    }

    const data: ImageData[] = [];
    for (const img of images) {
        const metaData = await getImageData(img.fullPath);
        data.push(metaData);
    }
    const atlas = await createAtlas(data, {
        maxWidth,
        maxHeight,
        padding: Math.max(padding, 0),
        outputPath,
        trim,
        atlasName: path.basename(inputPath),
        textureFormat,
    });
}

async function validateOptions(options: SpritePackerOptions) {
    if (options.maxWidth < 128) {
        throw new Error(`Maximum width must be greater than 128 pixels, got ${options.maxWidth}`);
    }

    if (options.maxHeight < 128) {
        throw new Error(`Maximum height must be greater than 128 pixels, got ${options.maxHeight}`);
    }

    const isTextureFormatSupported = SupportedTextureFormats.some((fmt) => fmt === options.textureFormat);
    if (!isTextureFormatSupported) {
        throw ErrorTextureFormatNotSupported;
    }

    const inputPathExist = await pathExist(options.inputPath);
    if (!inputPathExist) {
        throw new Error(
            `The input directory "${options.inputPath}" does not exist. Please provide a valid directory path.`
        );
    }
}
