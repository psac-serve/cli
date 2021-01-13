import {__} from "i18n";

import Module from "./base";

export default class Command extends Module {
    constructor(private _execute: Record<string, (options: string) => number> = {}) {
        super("Command", __("Parse / Run the commands."));
    }

    get execute(): Record<string, (options: string) => number> {
        return this._execute;
    }

    set execute(value: Record<string, (options: string) => number>) {
        this._execute = value;
    }

    init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    use(): { execute: (command: string) => number, list: Record<string, (options: string) => number> } {
        return {execute: (command: string): number => (command.split(" ")[0] in this.execute ? this.execute[command.split(" ")[0]](command.split(" ").slice(1).join()) : -1), list: this.execute };
    }

    close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
