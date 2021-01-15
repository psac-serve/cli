import { Command as AnotherCommand } from "../commands/base";
import Exit from "../commands/exit";

import Module from "./base";

export default class Command extends Module {
    constructor(private _commands: AnotherCommand[] = [], public execute: Record<string, (options: string) => number>[] = [{}]) {
        super("Command", "Parse / Run the commands.");
    }

    get commands(): string[] {
        return this._commands.map(command => command.name);
    }

    init(): Promise<void> {
        this.enabled = true;
        this._commands = [ new Exit() ];

        return Promise.resolve();
    }

    use(): { execute: (command: string) => number, list: Record<string, (options: string) => number>[] } {
        return {
            execute: (command: string): number => (command.split(" ")[0] in this.execute[0] ? this.execute[0][command.split(" ")[0]](command.split(" ").slice(1).join()) : -1),
            list: this.execute
        };
    }

    close(): Promise<void> {
        this._commands = [];
        this.enabled = false;

        return Promise.resolve();
    }
}
