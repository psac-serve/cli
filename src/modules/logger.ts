import path from "path";
import { default as AnotherLogger, LoggerOptions } from "@ptkdev/logger";
import { __ } from "i18n";

import manager from "..";

import ModuleNotEnabledError from "../errors/module-not-enabled";

import Module from "./base";


class VerboseAnotherLogger extends AnotherLogger {
    constructor(public verbose: boolean, public options: LoggerOptions) {
        super(options);
    }

    info(message: string, tag?: string) {
        if (!this.verbose) { return; }
        

        super.info(message, tag);
    }

    warning(message: string, tag?: string) {
        if (!this.verbose) { return; }
        

        super.warning(message, tag);
    }

    error(message: string, tag?: string) {
        if (!this.verbose) { return; }
        

        super.error(message, tag);
    }
}

export default class Logger extends Module {
    /**
     * Constructor.
     *
     * @param verbose       Enables verbose logging.
     * @param logger        Another logger library to use.
     * @param verboseLogger Another logger library to use with verbose mode.
     * @param settings      The module settings to operate this module.
     *
     * @returns The instance of this class.
     */
    constructor(private logger?: AnotherLogger, private verboseLogger?: VerboseAnotherLogger) {
        super("Logger", "A logging / debugging / beautify output module to manage log file, stdout, and so on");
    }

    init(): Promise<void> {
        const directories = manager.use("Directory Manager");

        directories.mkdirs();

        const loggerOptions = {
            debug: process.env.DEBUG === "1",
            sponsor: false,
            write: true,
            rotate: {
                size: "10K",
                encoding: "utf8"
            },
            path: {
                debug_log: path.join(directories.log, "debug.log"),
                error_log: path.join(directories.log, "errors.log")
            }
        } as LoggerOptions;

        [ this.logger, this.verboseLogger ] = [ new AnotherLogger(loggerOptions), new VerboseAnotherLogger(manager.use("Arguments Manager").verbose, loggerOptions) ];

        this.enabled = true;

        this.verboseLogger.info(__("Logger successfully created."));

        return Promise.resolve();
    }

    close(): Promise<void> {
        this.logger = undefined;
        this.enabled = false;

        return Promise.resolve();
    }

    use(): [ AnotherLogger, VerboseAnotherLogger ] {
        if (this.logger instanceof AnotherLogger && this.verboseLogger instanceof VerboseAnotherLogger) { return [ this.logger, this.verboseLogger ]; } else { throw new ModuleNotEnabledError(); }
        
    }
}

