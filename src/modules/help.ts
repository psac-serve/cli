import CliComponents from "../utils/cli/components";

import CommandNotFoundError from "../errors/command-not-found";

import Module from "./base";

type CliHeading = (text: string, wrapIn?: number, indent?: number) => string;
type CliContent = (text: string, indent?: number) => string;
type CliKeyValueContent = (contents: { [key: string]: string }[], indent?: number, truncate?: boolean) => string;
type CliBlankLine = () => string;

/**
 * Help module: Manage help documents using the database.
 */
export default class Help extends Module {
    /**
     * Constructor.
     *
     * @param helps Help reference store.
     */
    public constructor(public helps: { [key: string]: string[] }[] = [{}]) {
        super("Help", "Manage help documents using the database.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): { functions: [ CliHeading, CliContent, CliKeyValueContent, CliBlankLine ], helps: { [key: string]: string[] }[], getHelp: (command: string) => string } {
        return {
            functions: [
                CliComponents.heading,
                CliComponents.content,
                CliComponents.keyValueContent,
                CliComponents.blankLine
            ],
            getHelp: (command: string) => (command in this.helps[0]
                ? this.helps[0][command]
                : (() => {
                    throw new CommandNotFoundError();
                })()).join("\n"),
            helps: this.helps
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
