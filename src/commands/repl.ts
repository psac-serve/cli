import cliCursor from "cli-cursor";
import { terminal } from "terminal-kit";

import runLexer from "../lang/lexing";
import runParser from "../lang/parsing";

import LangError from "../errors/lang/base";

import manager from "../manager-instance";

import Quotes from "../utils/quotes";

import runInterpreter from "../lang/interpreter";

import { Command } from "./base";

import { help } from "./helps/repl";

export default class REPL extends Command<undefined> {
    public constructor() {
        super("repl", help);
    }

    public async execute(): Promise<number> {
        const { logger } = manager;

        logger.info("Welcome to the REPL environment (WIP).", true, "repl");

        const history: string[] = [];

        const run = async (): Promise<number> => {
            try {
                cliCursor.show();

                let command = await terminal("> ").inputField({
                    history
                }).promise;

                command = command || "";

                if (command === ".exit") {
                    return 0;
                }

                while (Quotes.check(command)) {
                    command += " " + (await terminal("\n... ").inputField({
                        autoComplete: undefined,
                        autoCompleteHint: false,
                        autoCompleteMenu: false
                    }).promise || "").trim();
                }

                while (!command.endsWith(";")) {
                    command += " " + (await terminal("\n... ").inputField({
                        autoComplete: undefined,
                        autoCompleteHint: false,
                        autoCompleteMenu: false
                    }).promise || "").trim();
                }

                terminal("\n");

                cliCursor.hide();

                if (command.trim() === "" || [ "#", "//" ].some(value => command?.trim().startsWith(value))) {
                    terminal("\n");

                    return run();
                }

                do {
                    command = command.slice(0, -1);
                } while (command.endsWith(";"));

                if (!(command in history)) {
                    history.push(command + ";");
                }

                command = command
                    .replace(/\\r/g, "\r")
                    .replace(/\\n/g, "\n")
                    .replace(/\\"/g, "\"")
                    .replace(/\\'/g, "'")
                    .replace(/\\`/g, "`")
                    .replace(/(["'`])/g, "");

                const
                    lexer = runLexer(command.trim(), "REPL"),
                    parsed = runParser(lexer);

                //console.log("%O", lexer.map(item => item.toString()));

                //console.log(parsed.toString());

                let resultValue = runInterpreter(parsed);

                while (resultValue && "value" in resultValue && typeof resultValue.value === "object") {
                    resultValue = resultValue.value;
                }

                console.log(resultValue?.toString());
            } catch (error) {
                if (error instanceof LangError) {
                    console.error(error.toString());
                } else {
                    console.error(error);
                }
            }

            return run();
        };

        return await run();
    }
}
