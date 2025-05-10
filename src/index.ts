import path from "path";
import { getImagesInDrectory, pathExist } from "./images";
import { createAtlas } from "./atlas";
import type { ImageData } from "./images";
import { getImageData } from "./images";
import { mkdir } from "fs/promises";

export type SpritePackerOptions = {
  inputPath: string;
  outputPath: string;
  maxWidth: number;
  maxHeight: number;
  padding: number;
  trim: boolean;
};

export async function spritesPacker(options: SpritePackerOptions) {
  await validateOptions(options);
  const { maxWidth, maxHeight, inputPath, outputPath, trim, padding } = options;

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
  });
}

async function validateOptions(options: SpritePackerOptions) {
  if (options.maxWidth < 128) {
    throw new Error(`Maximum width must be greater than 128 pixels, got ${options.maxWidth}`);
  }

  if (options.maxHeight < 128) {
    throw new Error(`Maximum height must be greater than 128 pixels, got ${options.maxHeight}`);
  }

  const inputPathExist = await pathExist(options.inputPath);
  if (!inputPathExist) {
    throw new Error(
      `The input directory "${options.inputPath}" does not exist. Please provide a valid directory path.`
    );
  }
}
