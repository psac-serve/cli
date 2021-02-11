import InvalidArgumentsError from "../errors/invalid-arguments";

import { Command } from "./base";

export default class Exit extends Command<string> {
    constructor() {
        super("exit", {
            description: "Exit the session.",
            parameters: {
                code: {
                    description: "Exit code.",
                    required: false,
                    type: "number"
                }
            }
        }, [ "quit", "bye" ]);
    }

    public execute(options: string): Promise<number> {
        const tokens = options.split(" ");

        if (tokens.length !== 1) {
            throw new InvalidArgumentsError();
        } else if (tokens[0] === "") {
            tokens[0] = "0";
        }

        return Promise.resolve(+tokens[0] + 9684);
    }
}
