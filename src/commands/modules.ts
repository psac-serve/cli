import chalk from "chalk";
import figures from "figures";
import { __ } from "i18n";

import manager from "..";

import { Command } from "./base";


export default class Modules extends Command<undefined> 
{
    constructor(private indent = "  ") 
    {
        super("modules", "Show all loaded modules.");
    }

    execute(): number 
    {
        console.log(chalk`{magentaBright ${figures.pointer} }${__("Loaded modules:")}`);
        manager.modules.forEach((module) => 
        {
            console.log(`${this.indent}${module.enabled ? chalk.green(figures.tick) : chalk.redBright(figures.cross)} {cyanBright ${module.name}} - ${module.description}`);
        });

        return 0;
    }
}
