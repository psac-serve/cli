import { CommandHelp } from "../modules/help";

import manager from "../manager-instance";

/**
 * Command abstract class.
 *
 * @typedef C Command arguments type.
 */
export abstract class Command<C extends string | undefined> {
    /**
     * Constructor.
     *
     * @param name Command name.
     * @param help Command help.
     * @param alias Command aliases.
     */
    protected constructor(public name: string, public help: CommandHelp, public alias: string[] = []) {
        for (const command of [ this.name, ...this.alias ]) {
            manager.use("Command").list[0][command] = this.execute;
            manager.use("Help").helps[0][command]   = this.help;
        }
    }

    abstract execute(options: C): Promise<number>
}

