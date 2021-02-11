import { __ } from "i18n";

import { CommandHelp } from "../modules/help";

import manager from "../manager-instance";

export abstract class Command<C extends string | undefined> {
    protected constructor(public name: string, public help: CommandHelp, public alias: string[] = []) {
        for (const command of [ this.name, ...this.alias ]) {
            manager.use("Command").list[0][command] = this.execute;
            manager.use("Help").helps[0][command]   = this.help;
        }
    }

    abstract execute(options: C): Promise<number>
}

