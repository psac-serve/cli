import { Command as AnotherCommand } from "../commands/base";
import Exit from "../commands/exit";
import Modules from "../commands/modules";
import Help from "../commands/help";
import Session from "../commands/session";

import CommandNotFoundError from "../errors/command-not-found";

import Module from "./base";

/**
 * Command module: Parse / Run the commands.
 */
export default class Command extends Module {
    /**
     * Constructor.
     *
     * @param _commands The instances of commands.
     * @param execute Command reference array.
     */
    public constructor(private _commands: AnotherCommand<string | undefined>[] = [], public execute: { [command: string]: (options: string) => number }[] = [{}]) {
        super("Command", "Parse / Run the commands.");
    }

    /**
     * Get the instances of commands.
     *
     * @returns The instances of commands.
     */
    public get commands(): string[] {
        return this._commands.map(command => command.name);
    }

    public init(): Promise<void> {
        this.enabled = true;
        this._commands = [ new Exit(), new Modules(), new Help(), new Session() ];

        return Promise.resolve();
    }

    public use(): { commands: (command: string) => number, list: { [command: string]: (options: string) => number }[] } {
        return {
            commands: (command: string): number => (command.split(" ")[0] in this.execute[0]
                ? this.execute[0][command.split(" ")[0]](command.split(" ").slice(1).join(" "))
                : (() => {
                    throw new CommandNotFoundError();
                })()),
            list: this.execute
        };
    }

    public close(): Promise<void> {
        this._commands = [];
        this.enabled = false;

        return Promise.resolve();
    }
}
