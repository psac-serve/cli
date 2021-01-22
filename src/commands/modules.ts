import chalk from "chalk";
import figures from "figures";
import { __ } from "i18n";
import { sprintf } from "sprintf-js";

import manager from "..";

import CliComponents from "../lib/cli/component";

import ModuleNotFoundError from "../errors/module-not-found";

import { Command } from "./base";

export default class Modules extends Command<string> 
{
    constructor() 
    {
        super("modules", "Show all loaded modules.", [ "module" ]);
    }

    execute(options: string): number 
    {
        if (options.trim() === "") 
        {

            console.log(CliComponents.heading(__("Loaded modules")));
            console.log(CliComponents.keyValueContent(manager.modules.map(module => ({ [(module.enabled ? chalk.green(figures.tick) : chalk.redBright(figures.cross)) + " " + chalk.blueBright(module.name)]: module.description })), { truncate: true }));

            return 0;
        }
        else 
        {
            const index = manager.modules.map(module => module.name).indexOf(options);

            if (index == -1) 
            
                throw new ModuleNotFoundError();
            

            const foundModule = manager.modules[index];

            console.log(CliComponents.heading(sprintf(__("Information for %s"), chalk.blueBright(foundModule.name))));
            console.log(`    ${chalk.cyanBright(__("Status"))}      ${foundModule.enabled ? chalk.greenBright(__("Enabled")) : chalk.redBright(__("Disabled"))}`);
            console.log(`    ${chalk.cyanBright(__("Description"))} ${chalk.whiteBright(foundModule.description)}`);

            return 0;
        }
    }
}
