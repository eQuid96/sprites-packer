import fs from "node:fs";
import { join, basename } from "path";
import sharp from "sharp";

export type ImageData = {
  readonly originalWidth: number;
  readonly originalHeight: number;
  trimmedWidth?: number;
  trimmedHeight?: number;
  buffer: Buffer;
  name: string;
  path: string;
};

export function getImagesInDrectory(dirPath: string) {
  const result: { path: string; name: string; fullPath: string }[] = [];
  const validExtensions = ["png"];
  if (fs.existsSync(dirPath)) {
    var files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        continue;
      }
      if (validExtensions.some((ext) => file.name.endsWith(ext))) {
        result.push({
          path: file.path,
          name: file.name,
          fullPath: join(file.path, file.name),
        });
      }
    }
  }

  return result;
}

export async function getImageSize(image: Buffer) {
  const { width, height } = await sharp(image).metadata();
  return {
    width: width ?? 0,
    height: height ?? 0,
  };
}

export async function getImageData(filePath: string): Promise<ImageData> {
  const data = await sharp(filePath).toBuffer();
  const { width, height } = await getImageSize(data);
  const spriteName = basename(filePath).split(".")[0];
  return {
    originalWidth: width ?? 0,
    originalHeight: height ?? 0,
    path: filePath,
    name: spriteName,
    buffer: data,
  };
}
export function isTrimmed(imageData: ImageData): boolean {
  if (imageData.trimmedWidth === undefined || imageData.trimmedHeight === undefined) {
    return false;
  }
  return imageData.originalWidth > imageData.trimmedWidth || imageData.originalHeight > imageData.trimmedHeight;
}
