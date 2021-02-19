import chalk from "chalk";
import Dot from "dot-object";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import CliComponents from "../utils/cli/components";

import HelpNotFoundError from "../errors/help-not-found";

import { default as manager, flags } from "../manager-instance";

import { buildArguments, buildParameters, buildSubcommands, buildUsage } from "../utils/cli/helper";

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
        super("Help", "Manage help documents automatically.");
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
                    " ",
                    CliComponents.heading("Usage"),
                    CliComponents.content(chalk`{dim $} {greenBright ${command}} ${buildUsage(help)}${"subcommands" in help ? chalk`{yellow <subcommand>} {dim [args...]}` : ""}`, 1)
                ]);

                if ("parameters" in help && help.parameters) {
                    helpArray.push(...[
                        " ",
                        CliComponents.heading("Parameters"),
                        CliComponents.keyValueContent(buildParameters(help), 1)
                    ]);
                }

                if ("arguments" in help && help.arguments) {
                    helpArray.push(...[
                        " ",
                        CliComponents.heading("Arguments"),
                        CliComponents.keyValueContent(buildArguments(help), 1)
                    ]);
                }

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
