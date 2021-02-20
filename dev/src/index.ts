import path from "path";
import fse from "fs-extra";
import json2md from "json2md";
import { program } from "commander";
import stripAnsi from "strip-ansi";

import { buildArguments, buildParameters, buildUsage } from "../../src/utils/cli/helper";
import { CommandHelp } from "../../src/modules/help";

program
    .command("psac-dev")
    .version("0.0.0")
    .description("Manage psac-serve/cli project.")
    .command("doc <directory>")
    .description("Generate documents for ban-client.", {
        directory: "Specify directory to generate."
    })
    .action(async (directory) => {
        if (!fse.existsSync(directory)) {
            await fse.mkdirs(directory);
        }

        const files = fse.readdirSync(path.join(__dirname, "..", "..", "src", "commands", "helps")).filter(file => path.basename(file) !== "base.ts");

        for (const file of files) {
            const { help }: { help: CommandHelp } = (await import(path.join(__dirname, "..", "..", "src", "commands", "helps", file)));

            // eslint-disable-next-line unicorn/consistent-function-scoping
            const generateMarkdown = (filename: string, help: CommandHelp, filepath = "", prefix = ""): void => {
                const markdownArray: { [key: string]: any }[] = [{
                    h1: `${prefix ? "Subcommand" : "Command"} \`${prefix ? prefix + " " : prefix}${filename}\``
                }, {
                    blockquote: help.description || "No description provided."
                }, {
                    h2: "Table of Contents"
                }, {
                    p: "<!-- START doctoc -->\n" +
                       "<!-- END doctoc -->"
                }, {
                    h2: "Usage"
                }, {
                    code: {
                        content: `$ ${prefix ? prefix + " " : ""}${filename} ${stripAnsi(buildUsage(help))}`,
                        language: "bash"
                    }
                }, {
                    h2: "Parameters"
                }];

                if ("parameters" in help && help.parameters) {
                    markdownArray.push({
                        p: "Command parameters:"
                    });

                    for (const parametersObject of buildParameters(help, false)) {
                        const [ name, description ] = Object.entries(parametersObject)[0];

                        markdownArray.push(...[{
                            h3: `\`${stripAnsi(name)}\``
                        }, {
                            p: stripAnsi(description)
                        }]);
                    }
                } else {
                    markdownArray.push({
                        h4: "No parameters."
                    });
                }

                markdownArray.push({
                    h2: "Arguments"
                });

                if ("arguments" in help && help.arguments) {
                    markdownArray.push({
                        p: "Command arguments:"
                    });

                    for (const parametersObject of buildArguments(help, false)) {
                        const [ name, description ] = Object.entries(parametersObject)[0];

                        markdownArray.push(...[{
                            h3: `\`${stripAnsi(name)}\``
                        }, {
                            p: stripAnsi(description)
                        }]);
                    }
                } else {
                    markdownArray.push({
                        h4: "No arguments."
                    });
                }

                markdownArray.push({
                    h2: "Subcommands"
                });

                if ("subcommands" in help && help.subcommands) {
                    markdownArray.push(...(Object.entries(help.subcommands).map(([ name, { description }]) => ({ h3: `[\`${name}\`](${path.join(`${filename}-subcmd`, `${name}.md`)}) - ${description}` }))));

                    for (const [ name, subcommand ] of Object.entries(help.subcommands)) {
                        fse.mkdirsSync(path.join(directory, `${filename}-subcmd`));
                        generateMarkdown(name, subcommand, path.join(directory, `${filename}-subcmd`, `${name}.md`), prefix ? `${prefix} ${filename}` : filename);
                    }
                } else {
                    markdownArray.push({
                        h4: "No subcommands."
                    });
                }

                console.log("Generating " + filepath);

                fse.writeFileSync(filepath, json2md(markdownArray));
            };

            generateMarkdown(path.basename(file).replace(".ts", ""), help, path.join(directory, path.basename(file).replace(".ts", ".md")));
        }

        console.info("All commands documents has successfully generated.");
    })
    .parse();
