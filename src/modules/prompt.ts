import chalk from "chalk";
import figures from "figures";
//import lexing from "lexing";
import { terminal } from "terminal-kit";

import cliCursor from "cli-cursor";

import { default as manager, flags } from "../manager-instance";

import Quotes from "../utils/quotes";
import { build } from "../utils/lexing";

import CommandNotFoundError from "../errors/command-not-found";
import InvalidArgumentsError from "../errors/invalid-arguments";
import ModuleNotFoundError from "../errors/module-not-found";
import SubCommandNotFoundError from "../errors/sub-command-not-found";

import Module from "./base";

import { Client } from "./native/clients";

export default class Prompt extends Module {
    constructor(private history: string[] = []) {
        super("Prompt", "Show beauty prompts.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): (code: number) => void {
        if (!flags.verbose) {
            terminal.move(0, -1);
        }

        const
            { hostname } = manager.sessions.sessions.find((session: Client) => session.id === manager.sessions.attaching),
            { logger } = manager;

        return async (code: number) => {
            cliCursor.show();

            const
                commands = manager.use("Command").list[0],
                autoComplete = Object.keys(commands);

            let count = 2;

            manager.prompting = true;

            const { sessions } = manager;

            let command = await terminal(chalk`\n{bold ${chalk.blueBright.underline(hostname)} as {cyanBright ${sessions.sessions.find((session: Client) => session.id === sessions.attaching).name}}${code !== 0 ? chalk.bold(" stopped with " + chalk.redBright(code)) : ""}} \n` +
                chalk`{magentaBright ${figures.pointer}${code !== 0 ? chalk.redBright(figures.pointer) : chalk.blueBright(figures.pointer)}${figures.pointer}} `).inputField({
                autoComplete,
                autoCompleteHint: true,
                autoCompleteMenu: true,
                history: this.history,
                tokenHook: (token, _, __, term) => {
                    if (token === ";" || [ "#", "//" ].some(value => token.startsWith(value))) {
                        return term.dim;
                    }

                    if (!Number.isNaN(+token)) {
                        return term.yellow;
                    }

                    if (/[&|]|\|\|/.test(token)) {
                        return term.brightBlue;
                    }

                    return autoComplete.includes(token) ? term.brightGreen : term.bold.brightRed;
                },
                tokenRegExp: build()
            }).promise;

            command = command || "";

            if (!command) {
                terminal("\n");

                terminal.saveCursor();
                terminal.move(0, -count);
                terminal.eraseLine();
                terminal.restoreCursor();

                terminal("\n");

                return this.use()(0);
            }

            while (Quotes.check(command)) {
                command += " " + (await terminal(chalk`\n   {blueBright ${figures.pointer}}     `).inputField({
                    autoComplete: undefined,
                    autoCompleteHint: false,
                    autoCompleteMenu: false
                }).promise || "").trim();
                count++;
                manager.promptCount++;
            }

            while (!command.endsWith(";")) {
                command += " " + (await terminal(chalk`\n   {greenBright ${figures.pointer}}     `).inputField({
                    autoComplete: undefined,
                    autoCompleteHint: false,
                    autoCompleteMenu: false
                }).promise || "").trim();
                count++;
                manager.promptCount++;
            }

            manager.prompting = false;

            terminal("\n");

            cliCursor.hide();

            terminal.saveCursor();
            terminal.move(0, -count);
            terminal.eraseLine();
            terminal.restoreCursor();

            //if (!Quotes.check(command)) {
            //    logger.error(__("Quotes are not closed."), true, "Command");

            //    return this.use()(1);
            //}

            //if (!command.endsWith(";")) {
            //    logger.error(__("Commands must end with ';'."), true, "Command");
            //}

            if (command.trim() === "" || [ "#", "//" ].some(value => command?.trim().startsWith(value))) {
                terminal("\n");
                terminal.move(0, -1);

                return this.use()(0);
            }

            do {
                command = command.slice(0, -1);
            } while (command.endsWith(";"));

            if (!(command in this.history)) {
                this.history.push(command + ";");
            }

            command = command
                .replace(/\\r/g, "\r")
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, "\"")
                .replace(/\\'/g, "'")
                .replace(/\\`/g, "`")
                .replace(/(["'`])/g, "");

            terminal("\n");
            terminal.move(0, -1);

            let stopCode;

            try {
                manager.prompting = false;
                manager.promptCount = 0;

                stopCode = await manager.use("Command").commands(command.trim());
            } catch (error) {
                if (error instanceof CommandNotFoundError) {
                    stopCode = 1;
                } else if (error instanceof InvalidArgumentsError) {
                    stopCode = 2;
                } else if (error instanceof ModuleNotFoundError) {
                    stopCode = 3;
                } else if (error instanceof SubCommandNotFoundError) {
                    stopCode = 4;
                } else {
                    stopCode = -1;
                }

                logger.error(error.message, true, "command");
            }

            if (stopCode >= 9684) {
                return stopCode - 9684;
            }

            console.log();

            return this.use()(stopCode);
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
