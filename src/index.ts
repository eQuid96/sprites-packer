import path from "path";
import { getImagesInDrectory } from "./images";
import { createAtlas } from "./atlas";
import type { ImageData } from "./images";
import { getImageData } from "./images";

async function main() {
  const basePath = process.cwd();
  const inputPath = path.resolve(basePath, "./media/symbols/");
  const outPutPath = path.resolve(basePath, "./output/");
  const images = getImagesInDrectory(inputPath);

  const data: ImageData[] = [];
  for (const img of images) {
    const metaData = await getImageData(img.fullPath);
    data.push(metaData);
  }
  const atlas = await createAtlas(data, {
    maxWidth: 2048,
    maxHeight: 2048,
    padding: 0,
    outputPath: outPutPath,
    trim: true,
    atlasName: path.basename(inputPath),
  });
}

main();
