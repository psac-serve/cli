import chalk from "chalk";

import manager from "../manager-instance";

import CliComponents from "../utils/cli/components";

import { Command } from "./base";

export default class Help extends Command<string> 
{
    constructor() 
    {
        super(
            "help",
            "Show help for a command.",
            [

            ]
        );
    }

    public execute(options: string): number 
    {
        const found = manager.use("Help").getHelp(options);

        console.log(CliComponents.heading(chalk`Help documentation for {greenBright ${options}}`));
        console.log(found);

        return 0;
    }
}
