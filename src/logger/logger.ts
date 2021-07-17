import { getLevelByName, getLevelName, LevelName, LogLevels } from "./levels.ts";
import { BaseHandler, ConsoleHandler } from "./handlers.ts";

// deno-lint-ignore no-explicit-any
export type GenericFunction = (...args: any[]) => any;

export interface LogRecordOptions {
    msg: string;
    args: unknown[];
    level: number;
    loggerName: string;
}

export class LogRecord {
    readonly msg: string;
    readonly level: number;
    readonly levelName: string;
    readonly loggerName: string;

    datetime: Date;

    constructor(options: LogRecordOptions) {
        this.msg = options.msg;
        this.level = options.level;
        this.loggerName = options.loggerName;
        this.datetime = new Date();
        this.levelName = getLevelName(options.level);
    }
}

export class LoggerConfig {
    level?: LevelName;
    handlers?: string[];
}

export interface LogConfig {
    handlers?: {
        [name: string]: BaseHandler;
    };
    loggers?: {
        [name: string]: LoggerConfig;
    };
}

const DEFAULT_LEVEL = "Info";
const DEFAULT_CONFIG: LogConfig = {
    handlers: {
        default: new ConsoleHandler(DEFAULT_LEVEL)
    },

    loggers: {
        default: {
            level: DEFAULT_LEVEL,
            handlers: [ "default" ]
        }
    }
};

const state = {
    handlers: new Map<string, BaseHandler>(),
    loggers: new Map<string, Logger>(),
    config: DEFAULT_CONFIG
};

/** Get a logger instance. If not specified `name`, get the default logger.  */
export function getLogger(name?: string): Logger {
    if (name == null) {
        const d = state.loggers.get("default");

        if (d == null) {
            throw new Error('"default" logger must be set for getting logger without name');
        }

        return d;
    }

    const result = state.loggers.get(name);

    if (!result) {
        const logger = new Logger(name, "Debug", { handlers: [] })

        state.loggers.set(name, logger);

        return logger;
    }

    return result;
}

export function debug<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function debug<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function debug<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    // Assist TS compiler with pass-through generic type
    if (msg instanceof Function) {
        return getLogger("default").debug(msg, ...args);
    }
    return getLogger("default").debug(msg, ...args);
}

export function hint<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function hint<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function hint<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    // Assist TS compiler with pass-through generic type
    if (msg instanceof Function) {
        return getLogger("default").hint(msg, ...args);
    }
    return getLogger("default").hint(msg, ...args);
}

export function success<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function success<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function success<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    // Assist TS compiler with pass-through generic type
    if (msg instanceof Function) {
        return getLogger("default").success(msg, ...args);
    }
    return getLogger("default").success(msg, ...args);
}

export function info<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function info<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function info<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    // Assist TS compiler with pass-through generic type
    if (msg instanceof Function) {
        return getLogger("default").info(msg, ...args);
    }
    return getLogger("default").info(msg, ...args);
}

export function warning<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function warning<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function warning<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    // Assist TS compiler with pass-through generic type
    if (msg instanceof Function) {
        return getLogger("default").warning(msg, ...args);
    }
    return getLogger("default").warning(msg, ...args);
}

export function error<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function error<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function error<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    if (msg instanceof Function) {
        return getLogger("default").error(msg, ...args);
    }

    return getLogger("default").error(msg, ...args);
}

export function fatal<T>(msg: () => T, ...args: unknown[]): T | undefined;
export function fatal<T>(
    msg: T extends GenericFunction ? never : T,
    ...args: unknown[]
): T;
export function fatal<T>(
    msg: (T extends GenericFunction ? never : T) | (() => T),
    ...args: unknown[]
): T | undefined {
    if (msg instanceof Function) {
        return getLogger("default").fatal(msg, ...args);
    }

    return getLogger("default").fatal(msg, ...args);
}

/** Setup logger config. */
export function setup(config: LogConfig): Promise<void> {
    state.config = {
        handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
        loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers }
    };

    state.handlers.forEach((handler): void => {
        handler.destroy();
    });

    state.handlers.clear();

    const handlers = state.config.handlers || {};

    for (const handlerName in handlers) {
        state.handlers.set(handlerName, handlers[handlerName]);
    }

    state.loggers.clear();

    const loggers = state.config.loggers || {};

    for (const loggerName in loggers) {
        const
            loggerConfig = loggers[loggerName],
            handlerNames = loggerConfig.handlers || [],
            handlers: BaseHandler[] = [];

        handlerNames.forEach((handlerName): void => {
            const handler = state.handlers.get(handlerName);

            if (handler) {
                handlers.push(handler);
            }
        });

        const
            levelName = loggerConfig.level || DEFAULT_LEVEL,
            logger = new Logger(loggerName, levelName, { handlers: handlers });

        state.loggers.set(loggerName, logger);
    }

    return Promise.resolve();
}

export interface LoggerOptions {
    handlers?: BaseHandler[];
}

export class Logger {
    #level: LogLevels;
    #handlers: BaseHandler[];

    readonly #loggerName: string;

    constructor(
        loggerName: string,
        levelName: LevelName,
        options: LoggerOptions = {}
    ) {
        this.#loggerName = loggerName;
        this.#level = getLevelByName(levelName);
        this.#handlers = options.handlers || [];
    }

    get level(): LogLevels {
        return this.#level;
    }

    set level(level: LogLevels) {
        this.#level = level;
    }

    get levelName(): LevelName {
        return getLevelName(this.#level);
    }

    set levelName(levelName: LevelName) {
        this.#level = getLevelByName(levelName);
    }

    get loggerName(): string {
        return this.#loggerName;
    }

    get handlers(): BaseHandler[] {
        return this.#handlers;
    }

    set handlers(handlers: BaseHandler[]) {
        this.#handlers = handlers;
    }

    asString(data: unknown): string {
        if (typeof data === "string") {
            return data;
        } else if (
            data === null ||
            typeof data === "number" ||
            typeof data === "bigint" ||
            typeof data === "boolean" ||
            typeof data === "undefined" ||
            typeof data === "symbol"
        ) {
            return String(data);
        } else if (data instanceof Error) {
            return data.stack!;
        } else if (typeof data === "object") {
            return JSON.stringify(data);
        }

        return "undefined";
    }

    debug<T>(msg: () => T, ...args: unknown[]): T | undefined;

    debug<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    debug<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Debug, msg, ...args);
    }

    hint<T>(msg: () => T, ...args: unknown[]): T | undefined;

    hint<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    hint<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Hint, msg, ...args);
    }

    success<T>(msg: () => T, ...args: unknown[]): T | undefined;

    success<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    success<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Success, msg, ...args);
    }

    info<T>(msg: () => T, ...args: unknown[]): T | undefined;

    info<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    info<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Info, msg, ...args);
    }

    warning<T>(msg: () => T, ...args: unknown[]): T | undefined;

    warning<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    warning<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Warning, msg, ...args);
    }

    error<T>(msg: () => T, ...args: unknown[]): T | undefined;

    error<T>(msg: T extends GenericFunction ? never : T, ...args: unknown[]): T;

    error<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Error, msg, ...args);
    }

    fatal<T>(msg: () => T, ...args: unknown[]): T | undefined;

    fatal<T>(
        msg: T extends GenericFunction ? never : T,
        ...args: unknown[]
    ): T;

    fatal<T>(
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        return this._log(LogLevels.Fatal, msg, ...args);
    }

    private _log<T>(
        level: number,
        msg: (T extends GenericFunction ? never : T) | (() => T),
        ...args: unknown[]
    ): T | undefined {
        if (this.level > level) {
            return msg instanceof Function ? undefined : msg;
        }

        let fnResult: T | undefined;
        let logMessage: string;

        if (msg instanceof Function) {
            fnResult = msg();
            logMessage = this.asString(fnResult);
        } else {
            logMessage = this.asString(msg);
        }

        const record: LogRecord = new LogRecord({
            msg: logMessage,
            args: args,
            level: level,
            loggerName: this.loggerName
        });

        this.#handlers.forEach((handler): void => {
            handler.handle(record);
        });

        return msg instanceof Function ? fnResult : msg;
    }
}

await setup(DEFAULT_CONFIG)
