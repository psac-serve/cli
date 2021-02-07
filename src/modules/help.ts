import chalk from "chalk";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import CliComponents from "../utils/cli/components";

import CommandNotFoundError from "../errors/command-not-found";

import { default as manager, flags } from "../manager-instance";

import Module from "./base";

type CliHeading = (text: string, wrapIn?: number, indent?: number) => string;
type CliContent = (text: string, indent?: number) => string;
type CliKeyValueContent = (contents: { [key: string]: string }[], indent?: number, truncate?: boolean) => string;
type CliBlankLine = () => string;

export default class Help extends Module {
    constructor(public helps: { [key: string]: string[] }[] = [{}]) {
        super("Help", "Manage help documents using the database.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): { functions: [ CliHeading, CliContent, CliKeyValueContent, CliBlankLine ], helps: { [key: string]: string[] }[], getHelp: (command: string) => string } {
        const { logger } = manager;

        return {
            functions: [
                CliComponents.heading,
                CliComponents.content,
                CliComponents.keyValueContent,
                CliComponents.blankLine
            ],
            getHelp: (command: string) => {
                logger.info(sprintf(__("Getting help for %s."), chalk.cyanBright(command)), !!flags.verbose);

                return command in this.helps[0]
                    ? this.helps[0][command].join("\n")
                    : (() => {
                        throw new CommandNotFoundError();
                    })();
            },
            helps: this.helps
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
