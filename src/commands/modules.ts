import chalk from "chalk";
import cliTruncate from "cli-truncate";
import figures from "figures";
import repeat from "repeat-string";
import { __ } from "i18n";

import manager from "..";

import { Command } from "./base";

export default class Modules extends Command<undefined> {
    constructor() {
        super("modules", "Show all loaded modules.", [ "module" ]);
    }

    execute(): number {
        const max = Math.max(...manager.modules.map(module => module.name.length));

        console.log(chalk`{magentaBright ${figures.pointer} }${__("Loaded modules:")}`);
        manager.modules.forEach(module => console.log(cliTruncate(`  ${module.enabled ? chalk.green(figures.tick) : chalk.redBright(figures.cross)} ${chalk.cyanBright(module.name)}${repeat(" ", max - module.name.length)} - ${chalk.whiteBright(module.description)}`, process.stdout.columns)));

        return 0;
    }
}
