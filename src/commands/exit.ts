import InvalidArgumentsError from "../errors/invalid-arguments";

import { Command } from "./base";

export default class Exit extends Command<string> {
    constructor() {
        super(
            "exit", {
                description: "Exit the session.",
                parameters: {
                    code: {
                        required: true
                    }
                }
            }, [ "quit", "bye" ]
        );
    }

    public execute(options: string): number {
        const tokens = options.split(" ");

        if (tokens.length !== 1) {
            throw new InvalidArgumentsError();
        } else if (tokens[0] === "") {
            tokens[0] = "0";
        }

        return +tokens[0] + 9684;
    }
}
