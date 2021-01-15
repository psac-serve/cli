import {__} from "i18n";

import manager from "..";

export abstract class Command {
    constructor(public name: string, private _description: string) {
        manager.use("Command").list[0] = { ...manager.use("Command").list[0], [this.name]: this.execute };
    }

    public get description(): string {
        return __(this._description);
    }

    abstract execute(options: string): number
}

