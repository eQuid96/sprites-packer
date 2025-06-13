import { spawn } from "node:child_process";
import * as os from "node:os";
import { chmod } from "node:fs/promises";
import path from "node:path";

/**
 * Options for Basisu compression.
 *
 * These options control the behavior of the Basis Universal compressor when
 * converting images into compressed formats.
 */
export type BasisuCompressionOptions = {
    /** Full path to the input file to be compressed */
    inputFilePath: string;
    /** Full path where the compressed output file will be saved */
    outputFilePath: string;

    /**
     * Quality level for compression.
     * @range 1-255
     * @default 255
     * @remarks Higher values provide better quality but larger file size
     */
    quality?: number;

    /**
     * Compression level.
     * @range 0-6
     * @default 1
     * @remarks Higher values provide better compression but slower processing
     */
    compressionLevel?: number;

    /**
     * Whether to use linear colorspace for encoding.
     * @default false (uses sRGB colorspace)
     */
    linear?: boolean;
};

export async function basisCompress(options: BasisuCompressionOptions): Promise<boolean> {
    const { platform, executable } = getBasisExecutable();
    if (platform !== "linux" && platform !== "win" && platform !== "darwin") {
        console.error("Unsupported platform.", platform);
        process.exit(1);
    }

    //give execution permission on linux and mac
    if (platform === "linux" || platform === "darwin") {
        await chmod(executable, "0755");
    }

    const quality = options.quality ?? 255;
    const compression = options.compressionLevel ?? 1;

    //prettier-ignore
    const args = [
        "-file", options.inputFilePath, 
        "-output_file", options.outputFilePath,
        "-q", quality.toString(),
        "-comp_level", compression.toString(),
    ];

    if (options.linear) {
        args.push("-linear");
    }

    return new Promise((resolve, reject) => {
        const basisu = spawn(executable, args);

        basisu.on("error", (error) => {
            console.error(`Error while compressing texture in basis: ${error.message}`);
            reject(false);
        });

        basisu.on("close", (code) => {
            if (code !== 0) {
                console.error(`Error while compressing texture in basis`);
                reject(false);
                return;
            }

            console.info(`Compression completed: ${path.basename(options.inputFilePath)}`);
            resolve(true);
        });
    });
}

const binaries: Record<string, string> = {
    "basisu-darwin-arm64": "../bin/darwin/arm64/basisu",
    "basisu-darwin-x64": "../bin/darwin/x64/basisu",
    "basisu-linux-arm64": "../bin/linux/arm64/basisu",
    "basisu-linux-x64": "../bin/linux/x64/basisu",
    "basisu-win-x64": "../bin/win/x64/basisu.exe",
};

function getBasisExecutable() {
    let platform: string = os.platform();

    if (platform == "win32") {
        platform = "win";
    }

    const arch = os.arch();
    const executable = path.resolve(__dirname, binaries[`basisu-${platform}-${arch}`]);
    return {
        platform,
        executable,
    };
}
