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
import { terminal } from "terminal-kit";

import manager from "../../manager-instance";

/**
 * Log-level.
 */
export enum Colors {
    info = "INFO",
    warning = "WARN",
    error = "ERROR",
    success = "SUCCESS"
}

/**
 * Module Manager Native Logger System (MMNLS).
 * Please use this logger for any logging.
 */
export default class Logger {
    /**
     * Generate formatted current date and time.
     *
     * @returns Formatted current date and time.
     *
     * @private
     */
    private static currentTime(): string {
        return (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -5).replace("T", " ");
    }

    /**
     * Normal log rotation stream.
     *
     * @private
     */
    private readonly logStream: RotatingFileStream;
    /**
     * Error log rotation stream.
     *
     * @private
     */
    private readonly errorLogStream: RotatingFileStream;

    /**
     * Constructor.
     *
     * @param log Normal log directory. ({@link info}, {@link warn}, {@link success})
     * @param errorLog Error log directory. ({@link error})
     */
    public constructor(private log: string = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "logs", "psac.log"), private errorLog: string = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "logs", "errors.log")) {
        this.logStream = createStream(log, { compress: true, encoding: "utf8", size: "10M" });

        this.errorLogStream = createStream(errorLog, { compress: true, encoding: "utf8", size: "10M" });
    }

    /**
     * Append the log to {@link log}.
     *
     * @param type Log-level.
     * @param tag Set the tag to the log.
     * @param message Log message.
     *
     * @private
     */
    private appendFile(type: Colors = Colors.info, tag = "", message = ""): void {
        if (!this.logStream) {
            throw new Error(__("Stream not found."));
        }

        if (tag !== "") {
            tag = `${tag}: `;
        }

        const
            prefix = `[${Logger.currentTime()}] [${type}]${tag ? ` (${tag})` : ""} `,
            body = message.split("\n").map((line, index) => (index !== 0 ? repeat(" ", stringWidth(prefix)) : "") + line).join("\n"),
            logText = prefix + body + "\n";

        fse.appendFile(this.log, stripAnsi(logText), (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * Append the log to {@link errorLog}.
     *
     * @param type Log-level.
     * @param tag Set the tag to the log.
     * @param message Log message.
     *
     * @private
     */
    private appendErrorFile(type: Colors = Colors.error, tag = "", message = ""): void {
        if (!this.errorLogStream) {
            throw new Error(__("Stream not found."));
        }

        if (tag !== "") {
            tag = `${tag}: `;
        }

        const
            prefix = `[${Logger.currentTime()}] [${type}]${tag ? ` (${tag})` : ""} `,
            body = message.split("\n").map((line, index) => (index !== 0 ? repeat(" ", stringWidth(prefix)) : "") + line).join("\n"),
            logText = prefix + body + "\n";

        fse.appendFileSync(this.errorLog, stripAnsi(logText));
    }

    /**
     * Output the log to process.stdout.
     *
     * @param type Log-level.
     * @param tag Set the tag to the log.
     * @param message Log message.
     *
     * @private
     */
    private stdout(type: Colors = Colors.info, tag = "", message = ""): void {
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
            leftLogMessage,
            leftLogWidth,
            middleLogMessage,
            splitMiddleLogMessage,
            time
        } = this.generateLog(typeSymbol, titleText, message, tag);

        if (-(stringWidth(splitMiddleLogMessage) - process.stdout.columns) - stringWidth(` ${tag} ${time} `) < 0) {
            if (manager.prompting) {
                terminal.saveCursor();
                terminal.move(0, -(manager.promptCount + 3));
                console.log();
            }

            console.log(supportsColor.stdout ? leftLogMessage + middleLogMessage : stripAnsi(leftLogMessage + middleLogMessage));

            if (manager.prompting) {
                terminal.restoreCursor();
            }
        } else {
            const mergedMessage = leftLogMessage + middleLogMessage + repeat(" ", -((middleLogMessage === splitMiddleLogMessage ? stringWidth(splitMiddleLogMessage) + leftLogWidth : stringWidth(splitMiddleLogMessage)) - process.stdout.columns) - stringWidth(` ${tag} ${time} `)) + chalk`{dim  ${tag} ${time}}`;

            if (manager.prompting) {
                terminal.saveCursor();
                terminal.move(0, -(manager.promptCount + 3));
                console.log();
            }

            console.log(supportsColor.stdout ? mergedMessage : stripAnsi(mergedMessage));

            if (manager.prompting) {
                terminal.restoreCursor();
            }
        }
    }

    /**
     * Generate beauty log.
     *
     * @param typeSymbol Log-level special symbol.
     * @param titleText Log-level title text.
     * @param message Log message.
     * @param tag Set the tag to the log.
     *
     * @private
     */
    private generateLog(typeSymbol: string, titleText: string, message: string, tag: string): {time: string, leftLogMessage: string, leftLogWidth: number, middleLogMessage: string, splitMiddleLogMessage: string} {
        const
            time = Logger.currentTime(),
            leftLogMessage = chalk`${typeSymbol} ${titleText} `,
            leftLogWidth = stringWidth(leftLogMessage),
            middleLogMessage = wrapAnsi(message, process.stdout.columns - leftLogWidth - stringWidth(` ${tag} ${time} `))
                .split("\n")
                .map((line, index) => (index !== 0 ? repeat(" ", leftLogWidth) + line : line))
                .join("\n"),
            splitMiddleLogMessage = middleLogMessage.split("\n").slice(-1)[0];

        return { leftLogMessage, leftLogWidth, middleLogMessage, splitMiddleLogMessage, time };
    }

    /**
     * Output the log to process.stderr.
     *
     * @param type Log-level.
     * @param tag Set the tag to the log.
     * @param message Log message.
     *
     * @private
     */
    private stderr(type: Colors = Colors.error, tag = "", message = ""): void {
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
            leftLogMessage,
            leftLogWidth,
            middleLogMessage,
            splitMiddleLogMessage,
            time
        } = this.generateLog(typeSymbol, titleText, message, tag);

        if (-(stringWidth(splitMiddleLogMessage) - process.stdout.columns) - stringWidth(` ${tag} ${time} `) < 0) {
            if (manager.prompting) {
                terminal.saveCursor();
                terminal.move(0, -(manager.promptCount + 3));
                console.log();
            }

            console.error(supportsColor.stdout ? leftLogMessage + middleLogMessage : stripAnsi(leftLogMessage + middleLogMessage));

            if (manager.prompting) {
                terminal.restoreCursor();
            }
        } else {
            const mergedMessage = leftLogMessage + middleLogMessage + repeat(" ", -((middleLogMessage === splitMiddleLogMessage ? stringWidth(splitMiddleLogMessage) + leftLogWidth : stringWidth(splitMiddleLogMessage)) - process.stdout.columns) - stringWidth(` ${tag} ${time} `)) + chalk`{dim  ${tag} ${time}}`;

            if (manager.prompting) {
                terminal.saveCursor();
                terminal.move(0, -(manager.promptCount + 3));
                console.log();
            }

            console.error(supportsColor.stdout ? mergedMessage : stripAnsi(mergedMessage));

            if (manager.prompting) {
                terminal.restoreCursor();
            }
        }
    }

    /**
     * Create information log.
     *
     * @param message Log message.
     * @param verbose If true, log output to stdout.
     * @param tag Set the tag to the log.
     */
    public info(message = "", verbose = true, tag = ""): void {
        if (verbose) {
            this.stdout(Colors.info, tag, `${message}`);
        }

        this.appendFile(Colors.info, tag, message);
    }

    /**
     * Create warning log.
     *
     * @param message Log message.
     * @param verbose If true, log output to stdout.
     * @param tag Set the tag to the log.
     */
    public warn(message = "", verbose = true, tag = ""): void {
        if (verbose) {
            this.stdout(Colors.warning, tag, `${message}`);
        }

        this.appendFile(Colors.warning, tag, message);
    }

    /**
     * Create error log.
     *
     * @param message Log message.
     * @param verbose If true, log output to stdout.
     * @param tag Set the tag to the log.
     */
    public error(message = "", verbose = true, tag = ""): void {
        if (verbose) {
            this.stderr(Colors.error, tag, `${message}`);
        }

        this.appendErrorFile(Colors.error, tag, message);
    }

    /**
     * Create success log.
     *
     * @param message Log message.
     * @param verbose If true, log output to stdout.
     * @param tag Set the tag to the log.
     */
    public success(message = "", verbose = true, tag = ""): void {
        if (verbose) {
            this.stdout(Colors.success, tag, `${message}`);
        }

        this.appendFile(Colors.success, tag, message);
    }
}
