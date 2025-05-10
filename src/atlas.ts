import { MaxRectsPacker } from "./max-rects-packer";
import sharp from "sharp";
import { getImageSize, isTrimmed, type ImageData } from "./images";
import { resolve } from "path";
import fs from "node:fs";

type AtlasSprite = {
  readonly width: number;
  readonly height: number;
  readonly rot: boolean;
  readonly x: number;
  readonly y: number;
  readonly imageData: ImageData;
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

export type AtlasOptions = {
  maxWidth: number;
  maxHeight: number;
  padding: number;
  trim: boolean;
  outputPath: string;
  atlasName: string;
};

export async function createAtlas(images: ImageData[], options: AtlasOptions) {
  options.maxWidth = Math.min(options.maxWidth, 4096);
  options.maxHeight = Math.min(options.maxHeight, 4096);

  const packer = new MaxRectsPacker<AtlasSprite>(options.maxWidth, options.maxHeight);

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

  packer.pack(packerData);
  const bins = packer.getBins();
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    const imagesToPack: { input: Buffer; top: number; left: number }[] = [];
    const sprites: AtlasSprites = {};
    for (const rect of bin.packedRects) {
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
    const atlasTextureName = `${atlasName}.webp`;
    const atlasConfigName = `${atlasName}.json`;
    const atlas = await sharp({
      create: {
        width: bin.width,
        height: bin.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(imagesToPack)
      .webp()
      .toFile(resolve(options.outputPath, atlasTextureName));
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
    fs.writeFileSync(resolve(options.outputPath, atlasConfigName), JSON.stringify(atlasConfigFile));
  }
}
