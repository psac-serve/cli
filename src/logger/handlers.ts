import { existsSync } from "https://x.nest.land/std@0.101.0/fs/exists.ts";
import { BufWriterSync } from "https://x.nest.land/std@0.101.0/io/bufio.ts";
import { gzipEncode as compress } from "https://github.com/manyuanrong/wasm_gzip/raw/master/mod.ts";

import * as colors from "https://x.nest.land/std@0.101.0/fmt/colors.ts";
import { wcswidth } from "https://deno.land/x/tty@0.1.2/wcwidth.ts";
import { stripAnsi } from "https://deno.land/x/tty@0.1.2/strip_ansi.ts";
import wrap from "https://deno.land/x/word_wrap@v0.1.1/mod.ts";
import { columns } from "../console/size.ts";

import { getLevelByName, LevelName, LogLevels } from "./levels.ts";
import { LogRecord } from "./logger.ts";

type FormatterFunction = (logRecord: LogRecord) => string;

export function currentLogTime(date: Date): string {
    return (
        new Date(+date.getTime() - (
            new Date()
        ).getTimezoneOffset() * 60000)
    ).toISOString().slice(0, -5).replace("T", " ");
}

export class BaseHandler {
    level: number;
    levelName: LevelName;
    formatter?: string | FormatterFunction;

    constructor(levelName: LevelName) {
        this.level = getLevelByName(levelName);
        this.levelName = levelName;

        this.formatter = "";
    }

    handle(logRecord: LogRecord): void {
        if (this.level > logRecord.level) {
            return;
        }

        return this.log(this.format(logRecord), logRecord.level);
    }

    format(logRecord: LogRecord): string {
        if (this.formatter instanceof Function) {
            return this.formatter(logRecord);
        }

        return `[ ${logRecord.levelName.toUpperCase() + " ".repeat(7 - logRecord.levelName.length)} ] ( ${logRecord.loggerName} ) ${currentLogTime(
            logRecord.datetime)} - ${logRecord.msg}`;
    }

    log(_msg: string, _level: LogLevels): void {
    }

    async destroy(): Promise<void> {
    }
}

export class ConsoleHandler extends BaseHandler {
    format(logRecord: LogRecord) {
        const symbols: Record<LevelName, string> = {
            Debug: colors.brightBlue("D"),
            Hint: colors.brightGreen("H"),
            Info: colors.brightBlue("ℹ"),
            Success: colors.brightGreen("✔"),
            Warning: colors.brightYellow("⚠"),
            Error: colors.brightRed("✖"),
            Fatal: colors.brightRed("✖")
        };

        const symbol: string = (
            symbols
        )[logRecord.levelName as LevelName];

        const levelName = (
            {
                Debug: (name) => colors.blue(colors.bold(colors.bold(name))),
                Hint: (name) => colors.green(colors.bold(name)),
                Info: (name) => colors.blue(colors.bold(name)),
                Success: (name) => colors.brightGreen(colors.bold(name)),
                Warning: (name) => colors.yellow(colors.bold(name)),
                Error: (name) => colors.red(colors.bold(name)),
                Fatal: (name) => colors.red(colors.bold(name))
            } as { [p: string]: (name: string) => string }
        )[logRecord.levelName](logRecord.levelName.toLowerCase() + " ".repeat(7 - logRecord.levelName.length));

        const
            leftLog = `${symbol}  ${levelName} `,
            leftLogWidth = wcswidth(stripAnsi(leftLog)),
            rightLog = ` ${logRecord.loggerName === "default" ? " " : logRecord.loggerName + " "}${currentLogTime(
                logRecord.datetime)
                .slice(11, 19)} `,
            rightLogWidth = wcswidth(stripAnsi(rightLog)),
            message = wrap(
                logRecord.msg,
                { width: columns - leftLogWidth - rightLogWidth, newline: "\n" + " ".repeat(leftLogWidth) }
            ),
            lastLineMessage = message.split("\n").slice(-1)[0],
            lastLineMessageWidth = wcswidth(stripAnsi(lastLineMessage)) + 6;

        if (-(
            lastLineMessageWidth - columns
        ) - rightLogWidth < 0) {
            // if (manager.prompting) {
            //     terminal.saveCursor();
            //     terminal.move(
            //         0,
            //         -(
            //             manager.promptCount + 3
            //         )
            //     );
            //     console.log();
            // }

            return leftLog + message;

            // if (manager.prompting) {
            //     terminal.restoreCursor();
            // }
        } else {
            // if (manager.prompting) {
            //     terminal.saveCursor();
            //     terminal.move(
            //         0,
            //         -(
            //             manager.promptCount + 3
            //         )
            //     );
            //     console.log();
            // }

            return leftLog + message + " ".repeat(-(
                (
                    message === lastLineMessage ? lastLineMessageWidth + leftLogWidth : lastLineMessageWidth
                ) - columns
            ) - leftLogWidth) + colors.gray(rightLog);

            // if (manager.prompting) {
            //     terminal.restoreCursor();
            // }
        }
    }

    log(msg: string, level: LogLevels): void {
        switch (level) {
            case LogLevels.Debug:
                console.debug(msg);

                break;

            case LogLevels.Hint:
            case LogLevels.Success:
                console.log(msg);

                break;

            case LogLevels.Info:
                console.info(msg);

                break;

            case LogLevels.Warning:
                console.warn(msg);

                break;

            default:
                console.error(msg);

                break;
        }
    }
}

export class RotatingFileHandler extends BaseHandler {
    protected _writer!: Deno.Writer;

    protected _filename = "./logs/psac.log";

    protected _file: Deno.File | undefined;

    protected _buf!: BufWriterSync;

    protected _encoder = new TextEncoder();

    readonly #maxBytes: number = 10 * 1024 * 1024;
    readonly #maxBackupCount: number = 8;

    #currentFileSize = 0;

    constructor(levelName: LevelName) {
        super(levelName);
    }

    async setup() {
        if (this.#maxBytes < 1) {
            await this.destroy();

            throw new Error("maxBytes cannot be less than 1");
        }

        if (this.#maxBackupCount < 1) {
            await this.destroy();

            throw new Error("maxBackupCount cannot be less than 1");
        }

        this._file = await Deno.open(this._filename, { append: true, create: true, write: true });
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);

        addEventListener("unload", this.unloadCallback.bind(this));

        this.#currentFileSize = (
            await Deno.stat(this._filename)
        ).size;
    }

    handle(logRecord: LogRecord): void {
        super.handle(logRecord);

        this.flush();
    }

    log(msg: string): void {
        const msgByteLength = this._encoder.encode(msg).byteLength + 1;

        if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
            this.rotateLogFiles();

            this.#currentFileSize = 0;
        }

        if (!this._buf) {
            this._buf = new BufWriterSync(this._file || Deno.openSync(
                this._filename,
                { append: true, create: true, write: true }
            ));
        }

        this._buf.writeSync(this._encoder.encode(msg + "\n"));

        this.#currentFileSize += msgByteLength;
    }

    flush(): void {
        if (this._buf?.buffered() > 0) {
            this._buf.flush();
        }
    }

    rotateLogFiles(): void {
        this._buf.flush();

        Deno.close(this._file!.rid);

        for (let i = this.#maxBackupCount - 1; i >= 0; i--) {
            const source = this._filename + (
                i === 0 ? "" : "." + i + ".gz"
            );

            const dest = this._filename + "." + (
                i + 1
            ) + ".gz";

            if (existsSync(source)) {
                Deno.writeFileSync(source, compress(Deno.readFileSync(source)));

                Deno.renameSync(source, dest);
            }
        }

        this._file = Deno.openSync(this._filename, { append: true, create: true });
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
    }

    destroy() {
        this.flush();

        this._file?.close();
        this._file = undefined;

        removeEventListener("unload", this.unloadCallback);

        return Promise.resolve();
    }

    protected unloadCallback() {
        this.destroy().then(r => r);
    }
}
