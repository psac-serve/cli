import chalk from "chalk";
import { __ } from "i18n";
import { CommandHelp } from "../../modules/help";

export const buildUsage = (help: CommandHelp): string => {
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

        [
            booleanArguments,
            numberArguments,
            stringArguments,
            requiredParameters,
            optionalParameters
        ] = [
            `${booleanArguments.trim()}`,
            `${numberArguments.trim()}`,
            stringArguments.trim(),
            requiredParameters.trim(),
            optionalParameters.trim()
        ];

        return (
            "arguments" in help && help.arguments
                ? chalk`{dim [}{blue ${booleanArguments}}{dim ]} {cyan ${numberArguments}}{magenta ${stringArguments}}`
                : ""
        ) + (
            "parameters" in help && help.parameters
                ? `${requiredParameters} ${optionalParameters}`
                : ""
        );
    },
    buildParameters = (help: CommandHelp, translate = true): { [key: string]: string }[] => ("parameters" in help && help.parameters
        ? Object.entries(help.parameters)
            .map(([ name, parameter ]) => ({
                [parameter.required
                    ? `<${parameter.type === "string" ? chalk.magenta(name) : chalk.blue(name)}>`
                    : chalk`{dim [}${parameter.type === "string"
                        ? chalk.magenta(name)
                        : chalk.blue(name)}{dim ]}`
                ]: translate
                    ? __(parameter.description)
                    : parameter.description
            }))
        : [{}]),
    buildArguments = (help: CommandHelp, translate = true): { [key: string]: string }[] => ("arguments" in help && help.arguments
        ? Object.entries(help.arguments)
            .map(([ name, argument ]) => "--" + name + ("alias" in argument ? `, -${argument.alias}` : ""))
            .map((_, index, titles) => ("arguments" in help && help.arguments
                ? ({ [titles[index]]: Object.values(help.arguments).map(({ description }) => (translate
                    ? __(description)
                    : description
                ))[index] })
                : {}))
        : [{}]),
    buildSubcommands = (help: CommandHelp, translate = true): { [key: string]: string }[] => ("subcommands" in help && help.subcommands
        ? Object.entries(help.subcommands).map(([ name, subcommandHelp ]) => ({
            [name]: translate
                ? __(subcommandHelp.description)
                : subcommandHelp.description
        }))
        : [{}]);
