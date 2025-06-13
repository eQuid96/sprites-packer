import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { color } from "./colors";
import { spritesPacker } from "sprites-packer";
import path from "node:path";

const options: ParseArgsOptionsConfig = {
    "input-dir": {
        type: "string",
        short: "i",
    },
    maxWidth: {
        type: "string",
        short: "w",
        default: "1024",
    },
    maxHeight: {
        type: "string",
        short: "h",
        default: "1024",
    },
    "texture-format": {
        type: "string",
        short: "f",
        default: "png",
    },
    trim: {
        type: "boolean",
        short: "t",
        default: true,
    },
    padding: {
        type: "string",
        short: "p",
        default: "4",
    },
    "output-dir": {
        type: "string",
        short: "o",
        default: "./sprites-packer-output",
    },
    help: {
        type: "boolean",
        short: "h",
        default: false,
    },
};

export async function CLI(args: string[]) {
    try {
        const { values } = parseArgs({ args, options });

        if (values.help || !values["input-dir"]) {
            help();
            return;
        }

        console.log("Processing sprites...");
        const result = await spritesPacker({
            inputPath: path.resolve(process.cwd(), values["input-dir"] as string),
            outputPath: path.resolve(process.cwd(), values["output-dir"] as string),
            maxWidth: parseInt(values.maxWidth as string),
            maxHeight: parseInt(values.height as string),
            padding: parseInt(values.padding as string),
            trim: values.trim as boolean,
            //@ts-ignore
            textureFormat: values["texture-format"],
        });
        color("[INFO]: Sprites packing completed!").green().log();
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.stack);
            fatal_error(error.message);
        }
        fatal_error("An Unknown error occurred");
    }
}

function help(): void {
    color(`
 ██████╗██████╗ ██████╗ ██╗████████╗███████╗███████╗    ██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝    ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
╚█████╗ ██████╔╝██████╔╝██║   ██║   █████╗  ███████╗    ██████╔╝███████║██║     █████╔╝ █████╗  ██████╔╝
 ╚═══██╗██╔═══╝ ██╔══██╗██║   ██║   ██╔══╝  ╚════██║    ██╔═══╝ ██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██████╔╝██║     ██║  ██║██║   ██║   ███████╗███████║    ██║     ██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝                                                                                           
`)
        .bold()
        .cyan()
        .log();
    console.log("Usage: sprites-packer [options]");
    console.log("Options:");
    console.log("  -i, --input-dir <path>     Directory containing sprite images (required)");
    console.log("  -o, --output-dir <path>    Output directory (default: ./sprites-packer-output)");
    console.log("  -w, --maxWidth <number>    Maximum texture width (default: 1024)");
    console.log("  -h, --maxHeight <number>   Maximum texture height (default: 1024)");
    console.log("  -f, --texture-format <fmt> Output texture format: basis, png or webp) (default: png)");
    console.log("  -t, --trim                 Trim transparent pixels (default: true)");
    console.log("  -p, --padding <number>     Padding between sprites (default: 4)");
    console.log("  --help                     Show this help message");
}

function fatal_error(message: string): never {
    const tag = color("[ERR]: ").bgBlack().red().str();
    console.error(`${tag} ${color(message).red().underscore().str()}`);
    process.exit(1);
}
