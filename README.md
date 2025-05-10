# SpritePacker

A lightweight and efficient Node.js tool for generating texture atlases from image collections. SpritePacker helps game developers and web designers optimize performance by combining multiple images into a single texture atlas with corresponding metadata.

![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Intelligent Packing**: Uses the MaxRects algorithm to efficiently organize sprites in the smallest possible atlas
- **Transparent Border Trimming**: Automatically removes unnecessary transparent pixels around images
- **Configurable Padding**: Add spacing between sprites to prevent texture bleeding
- **Customizable Output**: Control dimensions, padding, and more with flexible options
- **WebP Output**: Creates optimized WebP atlas images with corresponding JSON metadata

## Usage

You can use SpritePacker in your Node.js applications:

```javascript
const { spritesPacker } = require("sprites-packer");
// Or using ES modules:
// import { spritesPacker } from 'sprites-packer';

// Basic usage
await spritesPacker({
  inputPath: "./images",
  outputPath: "./atlas",
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  trim: true,
});

// Advanced usage with path resolution
const path = require("path");

await spritesPacker({
  inputPath: path.resolve(__dirname, "assets/characters"),
  outputPath: path.resolve(__dirname, "dist/atlases"),
  maxWidth: 4096,
  maxHeight: 4096,
  padding: 4,
  trim: false,
});
```

## Output Files

SpritePacker generates two files:

1. A `.webp` image file containing the packed texture atlas
2. A `.json` file with metadata about each sprite's position and dimensions

Example JSON output:

```json
{
  "frames": {
    "character1.png": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": { "x": 2, "y": 3, "w": 64, "h": 64 },
      "sourceSize": { "w": 68, "h": 70 }
    },
    "character2.png": {
      "frame": { "x": 68, "y": 0, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    }
  },
  "meta": {
    "image": "atlas.webp",
    "format": "RGBA8888",
    "size": { "w": 2048, "h": 2048 },
    "scale": 1
  }
}
```

## Requirements

- Node.js 14 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [sharp](https://github.com/lovell/sharp) for powerful image processing
- [maxrects-packer](https://github.com/soimy/maxrects-packer) for efficient sprite packing
