import { __ } from "i18n";

import manager from "../manager-instance";

export abstract class Command<C extends string | undefined> {
    protected constructor(public name: string, private _description: string, public help: string[], public alias: string[] = []) {
        for (const command of [ this.name, ...this.alias ]) {
            manager.use("Command").list[0][command] = this.execute;
            manager.use("Help").helps[0][command]   = this.help;
        }
    }

    public get description(): string {
        return __(this._description);
    }

    abstract execute(options: C): Promise<number>
}

