import chalk from "chalk";

import manager from "../manager-instance";

import CliComponents from "../utils/cli/components";

import { Command } from "./base";

export default class Help extends Command<string> {
    constructor() {
        super(
            "help",
            {
                description: "Show help for a command.",
                parameters: {
                    command: {
                        description: "The command to show help.",
                        required: false,
                        type: "string"
                    }
                }
            }
        );
    }

    public execute(options: string): Promise<number> {
        const found = manager.use("Help").getHelp(options);

        console.log(CliComponents.heading(chalk`Help documentation for {greenBright ${options}}`));
        console.log(found.split("\n").map((line: string) => "  " + line).join("\n"));

        return Promise.resolve(0);
    }
}
