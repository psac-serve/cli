import chalk from "chalk";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import CliComponents from "../utils/cli/components";

import CommandNotFoundError from "../errors/command-not-found";

import { default as manager, flags } from "../manager-instance";

import Module from "./base";

type CliHeading = (text: string, wrapIn?: number, indent?: number) => string;
type CliContent = (text: string, indent?: number) => string;
type CliKeyValueContent = (contents: {[key: string]: string}[], indent?: number, truncate?: boolean) => string;
type CliBlankLine = () => string;

export interface CommandHelp {
    arguments: {
        [name: string]: {
            alias?: string,
            description: string,
            defaultValue?: any,
            type: "string" | "number" | "boolean"
        }
    },
    parameters: {
        [parameter: string]: {
            required: boolean
        }
    },
    subcommands?: {
        [command: string]: CommandHelp
    }
}

export default class Help extends Module {
    constructor(public helps: {[key: string]: CommandHelp }[] = [{}]) {
        super("Help", "Manage help documents using the database.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): { functions: [ CliHeading, CliContent, CliKeyValueContent, CliBlankLine ], helps: {[key: string]: CommandHelp }[], getHelp: (command: string) => string } {
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
                    ? (() => {
                        const help = this.helps[0][command];
                        const helpArray: string[] = [];

                        let
                            aliasedArgument: { [key: string]: "string" | "number" | "boolean" } = {},
                            notAliasedArgument: { [key: string]: "string" | "number" | "boolean" } = {},
                            booleanArguments = "-",
                            numberArguments = "",
                            stringArguments = "";

                        for (const [ name, argument ] of Object.entries(help.arguments)) {
                            if (argument.type === "string" || argument.type === "number") {
                                if (name.length === 1) {
                                    aliasedArgument = { ...aliasedArgument, [name]: argument.type };
                                } else if (name.length > 1) {
                                    notAliasedArgument = { ...notAliasedArgument, [name]: argument.type };
                                }
                            } else if (argument.type === "boolean") {
                                if (name.length === 1) {
                                    aliasedArgument = { ...aliasedArgument, [name]: "boolean" };
                                } else if ("alias" in argument) {
                                    aliasedArgument = { ...aliasedArgument, [argument.alias || ""]: "boolean" };
                                } else {
                                    notAliasedArgument = { ...notAliasedArgument, [name]: "boolean" };
                                }
                            }
                        }

                        for (const [ alias, type ] of Object.entries(aliasedArgument)) {
                            if (type === "boolean") {
                                booleanArguments += alias;
                            } else if (type === "number") {
                                numberArguments += chalk`[-${alias}{underline n}] `;
                            } else if (type === "string") {
                                stringArguments += chalk`[-${alias} {underline string}] `;
                            }
                        }

                        booleanArguments += " ";

                        for (const [ name, type ] of Object.entries(notAliasedArgument)) {
                            if (type === "boolean") {
                                booleanArguments += `--${name} `;
                            } else if (type === "number") {
                                numberArguments += chalk`--${name} {underline number} `;
                            } else if (type === "string") {
                                stringArguments += chalk`--${name} {underline string} `;
                            }
                        }

                        [ booleanArguments, numberArguments, stringArguments ] = [ booleanArguments.trim(), numberArguments.trim(), stringArguments.trim() ];

                        helpArray.push(...[
                            CliComponents.heading("Usage"),
                            CliComponents.content(chalk`{dim $} {greenBright ${command}} {cyan ${booleanArguments}} {blue ${numberArguments}} {magenta ${stringArguments}} ${"subcommands" in help ? chalk`{yellow <subcommand>} {dim [args...]}` : ""}`)
                        ]);

                        return helpArray.join("\n");
                    })()
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
