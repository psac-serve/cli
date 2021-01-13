import { BaseCommand, Command } from "./base";

export default class Exit extends BaseCommand {
    evaluate(tokens: string): { code: number } {
        if (tokens.split(" ").length !== 1) {
            throw new Error("Invalid arguments");
        }

        // 今回はこうしてるけど関数の中でしかオブジェクトは管理しないから中身なんでもおｋ
        return { code: +tokens.split(" ")[0] };
    }

    @Command("exit")
    public execute(commands: string): number {
        return this.evaluate(commands).code + 9684;
    }
}
