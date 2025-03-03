# SpritePacker

SpritePacker is a CLI tool designed to generate texture atlases from a directory of images. It processes images, trims them if necessary, and packs them into a single texture atlas, outputting both the atlas image and a corresponding JSON configuration file.

## Features

- **Image Processing**: Automatically trims images to remove transparent borders.
- **Efficient Packing**: Uses the MaxRects algorithm to efficiently pack images into the smallest possible atlas.
- **Flexible Configuration**: Supports various configuration options such as maximum atlas size, padding, and output paths.
- **Output Formats**: Generates WebP atlas images and JSON configuration files.

## Installation

To install SpritePacker, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/sprites-packer.git
cd sprites-packer
npm install
```

## Usage

To use SpritePacker, run the following command:

```bash
node dist/index.js --input <input-directory> --output <output-directory> [options]
```

### Options

- `--input`: The directory containing the images to be packed.
- `--output`: The directory where the atlas image and JSON configuration file will be saved.
- `--maxWidth`: The maximum width of the atlas (default: 2048).
- `--maxHeight`: The maximum height of the atlas (default: 2048).
- `--padding`: The padding between images in the atlas (default: 0).
- `--trim`: Whether to trim transparent borders from images (default: true).
- `--atlasName`: The base name for the output atlas files (default: "atlas").

### Example

```bash
node dist/index.js --input ./media/symbols/ --output ./output/ --maxWidth 4096 --maxHeight 4096 --padding 2 --trim true --atlasName myAtlas
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [sharp](https://github.com/lovell/sharp) for image processing.
- [MaxRectsPacker](https://github.com/soimy/maxrects-packer) for the packing algorithm.
