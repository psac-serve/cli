import chalk from "chalk";
import Dot from "dot-object";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import CliComponents from "../utils/cli/components";

import HelpNotFoundError from "../errors/help-not-found";

import { default as manager, flags } from "../manager-instance";

import Module from "./base";

type CliHeading = (text: string, wrapIn?: number, indent?: number) => string;
type CliContent = (text: string, indent?: number) => string;
type CliKeyValueContent = (contents: {[key: string]: string}[], indent?: number, truncate?: boolean) => string;
type CliBlankLine = () => string;

export interface CommandArguments {
    [name: string]: {
        alias?: string,
        description: string,
        defaultValue?: any,
        type: "string" | "number" | "boolean"
    }
}

export interface CommandValues {
    [name: string]: {
        description: string,
        required: boolean,
        type: "string" | "number" | "boolean"
    }
}

export interface CommandParameters {
    [parameter: string]: {
        required: boolean
    }
}

export interface CommandHelp {
    description: string,
    arguments?: CommandArguments,
    parameters?: CommandParameters,
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

                const
                    dot = new Dot(" "),
                    help = dot.pick(command.replaceAll(/ {2,}/, " "), this.helps[0]) as CommandHelp | undefined;

                if (!help) {
                    throw new HelpNotFoundError();
                }

                const helpArray: string[] = [];

                helpArray.push(...[
                    CliComponents.keyValueContent([{
                        "Description": __(help.description)
                    }]),
                    CliComponents.blankLine()
                ]);

                const buildUsage = (help: CommandHelp): string => {
                    let
                        aliasedArgument: { [key: string]: "string" | "number" | "boolean" } = {},
                        notAliasedArgument: { [key: string]: "string" | "number" | "boolean" } = {},
                        booleanArguments = "-",
                        numberArguments = "",
                        stringArguments = "";

                    if ("arguments" in help && help.arguments) {
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
                                    aliasedArgument = { ...aliasedArgument, [argument.alias || "undefined"]: "boolean" };
                                } else {
                                    notAliasedArgument = { ...notAliasedArgument, [name]: "boolean" };
                                }
                            }
                        }

                        for (const [ alias, type ] of Object.entries(aliasedArgument)) {
                            if (type === "boolean") {
                                booleanArguments += alias;
                            } else if (type === "number") {
                                numberArguments += chalk`[-${alias}{white.dim.underline n}] `;
                            } else if (type === "string") {
                                stringArguments += chalk`[-${alias} {white.dim.underline string}] `;
                            }
                        }

                        booleanArguments += " ";

                        for (const [ name, type ] of Object.entries(notAliasedArgument)) {
                            if (type === "boolean") {
                                booleanArguments += `--${name} `;
                            } else if (type === "number") {
                                numberArguments += chalk`--${name} {white.dim.underline number} `;
                            } else if (type === "string") {
                                stringArguments += chalk`--${name} {white.dim.underline string} `;
                            }
                        }
                    }

                    let
                        requiredParameters = "",
                        optionalParameters = "";

                    if ("parameters" in help && help.parameters) {
                        for (const [ name, { required }] of Object.entries(help.parameters)) {
                            if (required) {
                                requiredParameters += chalk` <{blueBright ${name}}>`;
                            } else {
                                optionalParameters += chalk`[{dim ${name}}]`;
                            }
                        }
                    }

                    [ booleanArguments, numberArguments, stringArguments, requiredParameters, optionalParameters ] = [ booleanArguments.trim(), numberArguments.trim(), stringArguments.trim(), requiredParameters.trim(), optionalParameters.trim() ];

                    return ("arguments" in help && help.arguments ? chalk`[{blue ${booleanArguments}}] {cyan ${numberArguments}} {magenta ${stringArguments}}` : "") + ("parameters" in help && help.parameters ? `${requiredParameters} ${optionalParameters}` : "");
                };

                helpArray.push(...[
                    CliComponents.heading("Usage"),
                    CliComponents.content(chalk`{dim $} {greenBright ${command}} ${buildUsage(help)} ${"subcommands" in help ? chalk`{yellow <subcommand>} {dim [args...]}` : ""}`, 1),
                    CliComponents.blankLine()
                ]);

                const buildArguments = (help: CommandHelp): { [key: string]: string }[] => ("arguments" in help && help.arguments ? Object.entries(help.arguments).map(([ name, argument ]) => "--" + name + ("alias" in argument ? `, -${argument.alias}` : "")).map((_, index, titles) => ("arguments" in help && help.arguments ? ({ [titles[index]]: Object.values(help.arguments).map(({ description }) => description)[index] }) : {})) : [{}]);

                if ("arguments" in help && help.arguments) {
                    helpArray.push(...[
                        CliComponents.heading("Arguments"),
                        CliComponents.keyValueContent(buildArguments(help)),
                        CliComponents.blankLine()
                    ]);
                }

                if ("subcommands" in help && help.subcommands) {
                    helpArray.push(...[
                        CliComponents.heading("Subcommands"),
                        CliComponents.keyValueContent(Object.entries(help.subcommands).map(([ name, subcommandHelp ]) => ({ [name]: subcommandHelp.description })))
                    ]);
                }

                return helpArray.join("\n");
            },
            helps: this.helps
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
