import chalk from "chalk";
import Dot from "dot-object";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import CliComponents from "../utils/cli/components";

import HelpNotFoundError from "../errors/help-not-found";

import { default as manager, flags } from "../manager-instance";

import Module from "./base";

/**
 * Command arguments interface.
 */
export interface CommandArguments {
    /**
     * Argument name.
     */
    [name: string]: {
        /**
         * Argument aliases.
         */
        alias?: string,
        /**
         * Argument description.
         */
        description: string,
        /**
         * Argument default value.
         */
        defaultValue?: any,
        /**
         * Argument type.
         */
        type: "string" | "number" | "boolean"
    }
}

/**
 * Command values / parameters interface.
 */
export interface CommandValues {
    /**
     * Value name.
     */
    [name: string]: {
        /**
         * Value description.
         */
        description: string,
        /**
         * Value requirement.
         */
        required: boolean,
        /**
         * Value type.
         */
        type: "string" | "number"
    }
}

/**
 * Command help interface.
 */
export interface CommandHelp {
    /**
     * Command description.
     */
    description: string,
    /**
     * Command arguments.
     */
    arguments?: CommandArguments,
    /**
     * Command values / parameters.
     */
    parameters?: CommandValues,
    /**
     * Subcommands.
     */
    subcommands?: {
        /**
         * Subcommand name and help.
         */
        [command: string]: CommandHelp
    }
}

/**
 * Help module: Manage help documents using the database.
 */
export default class Help extends Module {
    /**
     * Constructor.
     *
     * @param helps - Help reference store.
     */
    public constructor(public helps: {[key: string]: CommandHelp }[] = [{}]) {
        super("Help", "Manage help documents using the database.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): { helps: {[key: string]: CommandHelp }[], getHelp: (command: string) => string } {
        const { logger } = manager;

        return {
            getHelp(command: string) {
                logger.info(sprintf(__("Getting help for %s."), chalk.cyanBright(command)), !!flags.verbose);

                const
                    dot = new Dot(" "),
                    help = dot.pick(command.replaceAll(/ {2,}/g, " ").split(" ").map((value, index, { length }) => (length - 1 != index ? `${value} subcommands` : value)).join(" "), this.helps[0]) as CommandHelp | undefined;

                if (!help) {
                    throw new HelpNotFoundError();
                }

                const helpArray: string[] = [];

                helpArray.push(...[
                    CliComponents.keyValueContent([{
                        "Description": __(help.description)
                    }]),
                    " "
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
                        for (const [ name, { required, type }] of Object.entries(help.parameters)) {
                            const color = type === "string" ? chalk.magenta : chalk.blue;

                            if (required) {
                                requiredParameters += chalk` <${color(name)}>`;
                            } else {
                                optionalParameters += chalk`{dim [}${color(name)}{dim ]}`;
                            }
                        }
                    }

                    [ booleanArguments, numberArguments, stringArguments, requiredParameters, optionalParameters ] = [ `${booleanArguments.trim()}`, `${numberArguments.trim()}`, stringArguments.trim(), requiredParameters.trim(), optionalParameters.trim() ];

                    return ("arguments" in help && help.arguments ? chalk`{dim [}{blue ${booleanArguments}}{dim ]} {cyan ${numberArguments}}{magenta ${stringArguments}}` : "") + ("parameters" in help && help.parameters ? `${requiredParameters} ${optionalParameters}` : "");
                };

                helpArray.push(...[
                    CliComponents.heading("Usage"),
                    CliComponents.content(chalk`{dim $} {greenBright ${command}} ${buildUsage(help)}${"subcommands" in help ? chalk`{yellow <subcommand>} {dim [args...]}` : ""}`, 1)
                ]);

                const buildParameters = (help: CommandHelp): { [key: string]: string }[] => ("parameters" in help && help.parameters ? Object.entries(help.parameters).map(([ name, parameter ]) => ({ [parameter.required ? `<${parameter.type === "string" ? chalk.magenta(name) : chalk.blue(name)}>` : chalk`{dim [}${parameter.type === "string" ? chalk.magenta(name) : chalk.blue(name)}{dim ]}`]: __(parameter.description) })) : [{}]);

                if ("parameters" in help && help.parameters) {
                    helpArray.push(...[
                        " ",
                        CliComponents.heading("Parameters"),
                        CliComponents.keyValueContent(buildParameters(help), 1)
                    ]);
                }

                const buildArguments = (help: CommandHelp): { [key: string]: string }[] => ("arguments" in help && help.arguments ? Object.entries(help.arguments).map(([ name, argument ]) => "--" + name + ("alias" in argument ? `, -${argument.alias}` : "")).map((_, index, titles) => ("arguments" in help && help.arguments ? ({ [titles[index]]: Object.values(help.arguments).map(({ description }) => __(description))[index] }) : {})) : [{}]);

                if ("arguments" in help && help.arguments) {
                    helpArray.push(...[
                        " ",
                        CliComponents.heading("Arguments"),
                        CliComponents.keyValueContent(buildArguments(help), 1)
                    ]);
                }

                const buildSubcommands = (help: CommandHelp): { [key: string]: string }[] => ("subcommands" in help && help.subcommands ? Object.entries(help.subcommands).map(([ name, subcommandHelp ]) => ({ [name]: subcommandHelp.description })) : [{}]);

                if ("subcommands" in help && help.subcommands) {
                    helpArray.push(...[
                        " ",
                        CliComponents.heading("Subcommands"),
                        CliComponents.keyValueContent(buildSubcommands(help), 1)
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
