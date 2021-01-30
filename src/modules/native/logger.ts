import path from "path";
import fse from "fs-extra";
import { createStream, RotatingFileStream } from "rotating-file-stream";
import stripAnsi from "strip-ansi";
import figures from "figures";
import chalk from "chalk";
import supportsColor from "supports-color";
import stringWidth from "string-width";
import repeat from "repeat-string";
import wrapAnsi from "wrap-ansi";
import { __ } from "i18n";

enum Colors {
    info = "INFO",
    warning = "WARN",
    error = "ERROR",
    success = "SUCCESS"
}

export default class Logger {
    private readonly logStream: RotatingFileStream;
    private readonly errorLogStream: RotatingFileStream;

    constructor(private log: string = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "logs", "psac.log"), private errorLog: string = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "logs", "errors.log")) {
        this.logStream = createStream(log, { size: "10K", encoding: "utf8", compress: true });

        this.errorLogStream = createStream(errorLog, { size: "10K", encoding: "utf8", compress: true });
    }

    currentTime(): string {
        return (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace("T", " ");
    }

    appendFile(type: Colors = Colors.info, tag = "", message = ""): void {
        if (!this.logStream) {
            throw new Error(__("Stream not found."));
        }

        if (tag !== "") {
            tag = `${tag}: `;
        }

        const
            prefix = `[${this.currentTime()}] [${type}]${tag ? ` (${tag})` : ""} `,
            body = message.split("\n").map((line, index) => (index !== 0 ? repeat(" ", stringWidth(prefix)) : "") + line).join("\n"),
            logText = prefix + body + "\n";

        fse.appendFile(this.log, stripAnsi(logText), (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    appendErrorFile(type: Colors = Colors.error, tag = "", message = ""): void {
        if (!this.errorLogStream) {
            throw new Error(__("Stream not found."));
        }

        if (tag !== "") {
            tag = `${tag}: `;
        }

        const
            prefix = `[${this.currentTime()}] [${type}]${tag ? ` (${tag})` : ""} `,
            body = message.split("\n").map((line, index) => (index !== 0 ? repeat(" ", stringWidth(prefix)) : "") + line).join("\n"),
            logText = prefix + body + "\n";

        fse.appendFile(this.errorLog, stripAnsi(logText), (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    stdout(type: Colors = Colors.info, tag = "", message = ""): void {
        if (tag !== "") {
            tag = ` ${tag}:`;
        }

        let typeSymbol: string;
        let titleText: string;

        switch (type) {
            case Colors.info:
                typeSymbol = chalk.magentaBright(figures.pointer);
                titleText = chalk.underline.blueBright("info") + "   ";

                break;

            case Colors.warning:
                typeSymbol = chalk.yellowBright(figures.warning);
                titleText = chalk.underline.yellowBright("warn") + "   ";

                break;

            case Colors.error:
                typeSymbol = chalk.redBright(figures.cross);
                titleText = chalk.underline.redBright("error") + "  ";

                break;

            default:
                typeSymbol = chalk.greenBright(figures.tick);
                titleText = chalk.underline.greenBright("success");

                break;
        }

        const {
            time,
            leftLogMessage,
            leftLogWidth,
            middleLogMessage,
            splitMiddleLogMessage
        } = this.generateLog(typeSymbol, titleText, message, tag);

        if (-(stringWidth(splitMiddleLogMessage) - process.stdout.columns) - stringWidth(` ${tag} ${time} `) < 0) {
            console.log(supportsColor.stdout ? leftLogMessage + middleLogMessage : stripAnsi(leftLogMessage + middleLogMessage));
        } else {
            const mergedMessage = leftLogMessage + middleLogMessage + repeat(" ", -((middleLogMessage === splitMiddleLogMessage ? stringWidth(splitMiddleLogMessage) + leftLogWidth : stringWidth(splitMiddleLogMessage)) - process.stdout.columns) - stringWidth(` ${tag} ${time} `)) + chalk`{dim  ${tag} ${time}}`;

            console.log(supportsColor.stdout ? mergedMessage : stripAnsi(mergedMessage));
        }
    }

    private generateLog(typeSymbol: string, titleText: string, message: string, tag: string): {time: string, leftLogMessage: string, leftLogWidth: number, middleLogMessage: string, splitMiddleLogMessage: string} {
        const
            time = this.currentTime(),
            leftLogMessage = chalk`${typeSymbol} ${titleText} `,
            leftLogWidth = stringWidth(leftLogMessage),
            middleLogMessage = wrapAnsi(message, process.stdout.columns - leftLogWidth - stringWidth(` ${tag} ${time} `))
                .split("\n")
                .map((line, index) => (index !== 0 ? repeat(" ", leftLogWidth) + line : line))
                .join("\n"),
            splitMiddleLogMessage = middleLogMessage.split("\n").slice(-1)[0];

        return { time, leftLogMessage, leftLogWidth, middleLogMessage, splitMiddleLogMessage };
    }

    stderr(type: Colors = Colors.error, tag = "", message = ""): void {
        if (tag !== "") {
            tag = ` ${tag}:`;
        }

        let typeSymbol: string;
        let titleText: string;

        switch (type) {
            case Colors.info:
                typeSymbol = chalk.magentaBright(figures.pointer);
                titleText = chalk.underline.blueBright("info") + "   ";

                break;

            case Colors.warning:
                typeSymbol = chalk.yellowBright(figures.warning);
                titleText = chalk.underline.yellowBright("warn") + "   ";

                break;

            case Colors.error:
                typeSymbol = chalk.redBright(figures.cross);
                titleText = chalk.underline.redBright("error") + "  ";

                break;

            default:
                typeSymbol = chalk.greenBright(figures.tick);
                titleText = chalk.underline.greenBright("success");

                break;
        }

        const {
            time,
            leftLogMessage,
            leftLogWidth,
            middleLogMessage,
            splitMiddleLogMessage
        } = this.generateLog(typeSymbol, titleText, message, tag);

        if (-(stringWidth(splitMiddleLogMessage) - process.stdout.columns) - stringWidth(` ${tag} ${time} `) < 0) {
            console.error(supportsColor.stdout ? leftLogMessage + middleLogMessage : stripAnsi(leftLogMessage + middleLogMessage));
        } else {
            const mergedMessage = leftLogMessage + middleLogMessage + repeat(" ", -((middleLogMessage === splitMiddleLogMessage ? stringWidth(splitMiddleLogMessage) + leftLogWidth : stringWidth(splitMiddleLogMessage)) - process.stdout.columns) - stringWidth(` ${tag} ${time} `)) + chalk`{dim  ${tag} ${time}}`;

            console.error(supportsColor.stdout ? mergedMessage : stripAnsi(mergedMessage));
        }
    }

    info(message = "", verbose = true, tag = ""): void {
        if (verbose) {
            this.stdout(Colors.info, tag, `${message}`);
        }

        this.appendFile(Colors.info, tag, message);
    }

    warn(message = "", verbose = true, tag = ""): void {
        if (!verbose) {
            this.stdout(Colors.warning, tag, `${message}`);
        }

        this.appendFile(Colors.warning, tag, message);
    }

    error(message = "", verbose = true, tag = ""): void {
        if (!verbose) {
            this.stderr(Colors.error, tag, `${message}`);
        }

        this.appendErrorFile(Colors.error, tag, message);
    }
}
