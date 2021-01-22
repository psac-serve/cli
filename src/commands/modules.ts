import chalk from "chalk";
import cliTruncate from "cli-truncate";
import figures from "figures";
import repeat from "repeat-string";
import { __ } from "i18n";
import { sprintf } from "sprintf-js";

import manager from "..";

import ModuleNotFoundError from "../errors/module-not-found";

import { Command } from "./base";

import "../lib/format.extensions";

export default class Modules extends Command<string> {
    constructor() {
        super("modules", "Show all loaded modules.", [ "module" ]);
    }

    execute(options: string): number {
        if (options.trim() === "") {
            const max = Math.max(...manager.modules.map(module => module.name.length));

            console.log(chalk`{magentaBright ${figures.pointer} }${__("Loaded modules:")}`);
            manager.modules.forEach(module => console.log(cliTruncate(`  ${module.enabled ? chalk.green(figures.tick) : chalk.redBright(figures.cross)} ${chalk.cyanBright(module.name)}${repeat(" ", max - module.name.length)} - ${chalk.whiteBright(module.description)}`, process.stdout.columns, { space: true })));

            return 0;
        } else {
            const index = manager.modules.map(module => module.name).indexOf(options);

            if (index == -1) {
                throw new ModuleNotFoundError();
            }

            const foundModule = manager.modules[index];

            console.log(chalk`{inverse  ${sprintf(__("Information for %s"), foundModule.name)} }`);
            console.log(`  ${chalk.cyanBright(__("Status"))}      ${foundModule.enabled ? chalk.greenBright(__("Enabled")) : chalk.redBright(__("Disabled"))}`);
            console.log(`  ${chalk.cyanBright(__("Description"))} ${chalk.whiteBright(foundModule.description)}`);

            return 0;
        }
    }
}
