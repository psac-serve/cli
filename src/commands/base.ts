import { __ } from "i18n";

import manager from "..";

export abstract class Command<T extends string | undefined> {
    protected constructor(public name: string, private _description: string, public alias: string[] = []) {
        [ this.name, ...this.alias ].forEach((command) => {
            manager.use("Command").list[0][command] = this.execute; 
        });
    }

    public get description(): string {
        return __(this._description);
    }

    abstract execute(options: T): number
}

