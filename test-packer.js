const { spritesPacker } = require("./dist/index");
const path = require("path");

spritesPacker({
  inputPath: path.resolve(process.cwd(), "media/symbols"),
  outputPath: path.resolve(process.cwd(), "output"),
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 4,
  trim: true,
  textureFormat: "png",
});
