export const Colors = {
    // Color codes
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    underscore: "\x1b[4m",

    // Text colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    // Background colors
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
};

export function color(msg: string) {
    let textColor: string = "";
    let bgColor: string = "";
    let style: string = "";

    return {
        blue() {
            textColor = Colors.blue;
            return this;
        },
        red() {
            textColor = Colors.red;
            return this;
        },
        green() {
            textColor = Colors.green;
            return this;
        },
        yellow() {
            textColor = Colors.yellow;
            return this;
        },
        black() {
            textColor = Colors.black;
            return this;
        },
        magenta() {
            textColor = Colors.magenta;
            return this;
        },
        cyan() {
            textColor = Colors.cyan;
            return this;
        },
        white() {
            textColor = Colors.white;
            return this;
        },

        // Background colors
        bgBlack() {
            bgColor = Colors.bgBlack;
            return this;
        },
        bgRed() {
            bgColor = Colors.bgRed;
            return this;
        },
        bgGreen() {
            bgColor = Colors.bgGreen;
            return this;
        },
        bgYellow() {
            bgColor = Colors.bgYellow;
            return this;
        },
        bgBlue() {
            bgColor = Colors.bgBlue;
            return this;
        },
        bgMagenta() {
            bgColor = Colors.bgMagenta;
            return this;
        },
        bgCyan() {
            bgColor = Colors.bgCyan;
            return this;
        },
        bgWhite() {
            bgColor = Colors.bgWhite;
            return this;
        },

        bold() {
            style = Colors.bold;
            return this;
        },
        underscore() {
            style = Colors.underscore;
            return this;
        },

        str() {
            return `${style}${bgColor}${textColor}${msg}${Colors.reset}`;
        },
        log() {
            console.log(this.str());
        },
        info() {
            console.info(this.str());
        },
        warn() {
            console.warn(this.str());
        },
        error() {
            console.error(this.str());
        },
    };
}
