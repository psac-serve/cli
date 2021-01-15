import { Command } from "./base";

export default class Exit extends Command {
    constructor() {
        // 第一引数にコマンド名、第二引数に説明を入れる
        super("exit", "Exit the session.");
    }

    public execute(options: string): number {
        const tokens = options.split(" ");

        if (tokens.length !== 1 || tokens[0] === "") {
            throw new Error("Invalid arguments.");
        }

        return +tokens[0] + 9684;
    }
}
