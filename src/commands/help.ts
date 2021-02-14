import chalk from "chalk";

import manager from "../manager-instance";

import CliComponents from "../utils/cli/components";

import { Command } from "./base";

/**
 * Show help for a command.
 */
export default class Help extends Command<string> {
    /**
     * Constructor.
     */
    public constructor() {
        super(
            "help",
            "Show help for a command.",
            [

            ]
        );
    }

    public execute(options: string): Promise<number> {
        const found = manager.use("Help").getHelp(options);

        console.log(CliComponents.heading(chalk`Help documentation for {greenBright ${options}}`));
        console.log(found);

        return Promise.resolve(0);
    }
}
