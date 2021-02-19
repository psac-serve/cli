import chalk from "chalk";
import figures from "figures";
import { __ } from "i18n";
import { sprintf } from "sprintf-js";

import CliComponents from "../utils/cli/components";

import manager from "../manager-instance";

import ModuleNotFoundError from "../errors/module-not-found";
import SubCommandNotFoundError from "../errors/sub-command-not-found";

import { Command } from "./base";

import { help } from "./helps/modules";

/**
 * Show loaded modules.
 */
export default class Modules extends Command<string> {
    /**
     * Constructor.
     */
    public constructor() {
        super(
            "modules",
            help,
            [ "module" ]
        );
    }

    execute(options: string): Promise<number> {
        const subCommand = options.trim().split(" ")[0];

        return {
            "list": () => {
                console.log(CliComponents.heading(__("Loaded modules")));
                console.log(CliComponents.keyValueContent(manager.modules.map(module => ({ [(module.enabled ? chalk.green(figures.tick) : chalk.redBright(figures.cross)) + " " + chalk.blueBright(module.name)]: module.description })), 0, true));

                return Promise.resolve(0);
            },
            "show": () => {
                const index = manager.modules.map(module => module.name.toLowerCase()).indexOf(options.trim().split(" ").slice(1).join(" ").toLowerCase());

                if (index == -1) {
                    throw new ModuleNotFoundError();
                }

                const foundModule = manager.modules[index];

                console.log(CliComponents.heading(sprintf(__("Information for %s"), chalk.blueBright(foundModule.name))));
                console.log(`    ${chalk.cyanBright(__("Status"))}      ${foundModule.enabled ? chalk.greenBright(__("Enabled")) : chalk.redBright(__("Disabled"))}`);
                console.log(`    ${chalk.cyanBright(__("Description"))} ${chalk.whiteBright(foundModule.description)}`);

                return Promise.resolve(0);
            }
        }[!subCommand || subCommand === "list"
            ? "list"
            : (subCommand === "show"
                ? "show"
                : (() => {
                    throw new SubCommandNotFoundError();
                })())]();
    }
}
