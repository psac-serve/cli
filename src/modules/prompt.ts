import chalk from "chalk";
import figures from "figures";
import readlineSync from "readline-sync";
import { __ } from "i18n";

import cliCursor from "cli-cursor";

import manager from "..";

import Quotes from "../utils/quotes";

import CommandNotFoundError from "../errors/command-not-found";
import InvalidArgumentsError from "../errors/invalid-arguments";
import ModuleNotFoundError from "../errors/module-not-found";
import SubCommandNotFoundError from "../errors/sub-command-not-found";

import Module from "./base";

export default class Prompt extends Module {
    constructor() {
        super("Prompt", "Show beauty prompts.");
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): (code: number) => void {
        const { hostname } = manager.use("Client");

        return (code: number) => {
            cliCursor.show();

            let command = "";

            command = readlineSync.question(chalk`{bold {blueBright.underline ${hostname}} as {cyanBright ban-server}${code !== 0
                ? chalk.bold(" stopped with " + chalk.redBright(code))
                : ""}}\n {magentaBright ${figures.pointer}${code !== 0 ? chalk.redBright(figures.pointer)
                : chalk.blueBright(figures.pointer)}${figures.pointer}} `).trim();

            while (Quotes.check(command)) {
                command += " " + readlineSync.question(chalk`   {blueBright ${figures.pointer}}     `).trim();
            }

            if (command.trim() === "" || (command.startsWith("/*") && command.endsWith("*/")) || [ "#", "//", ";" ].some(value => command.trim()
                .startsWith(value))) {
                return this.use()(0);
            } else if (command.startsWith("/*") && !command.endsWith("*/")) {
                console.log(chalk`{bgRedBright.black  ERROR } ` + chalk.redBright(__("This comment block must be enclosed in */.")));
            }

            while (!command.endsWith(";")) {
                command += " " + readlineSync.question(chalk`   {greenBright ${figures.pointer}}     `).trim();
            }

            cliCursor.hide();

            do {
                command = command.slice(0, -1);
            } while (command.endsWith(";"));

            command = command
                .replace(/\\r/g, "\r")
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, "\"")
                .replace(/\\'/g, "'")
                .replace(/\\`/g, "`")
                .replace(/(["'`])/g, "");

            let stopCode;

            try {
                stopCode = manager.use("Command").commands(command.trim());
            } catch (error) {
                if (error instanceof CommandNotFoundError) {
                    stopCode = -1;
                } else if (error instanceof InvalidArgumentsError) {
                    stopCode = 2;
                } else if (error instanceof ModuleNotFoundError) {
                    stopCode = 3;
                } else if (error instanceof SubCommandNotFoundError) {
                    stopCode = 4;
                } else {
                    stopCode = 1;
                }

                console.log(chalk`{bgRedBright.black  ERROR } ` + chalk.redBright(__(error.message)));
            }

            if (stopCode >= 9684) {
                return stopCode - 9684;
            }

            return this.use()(stopCode);
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
