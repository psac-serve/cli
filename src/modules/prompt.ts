import chalk from "chalk";
import figures from "figures";
import readlineSync from "readline-sync";

import cliCursor from "cli-cursor";

import manager from "../manager-instance";

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
        const
            { hostname } = manager.use("Client"),
            { logger } = manager;

        return (code: number) => {
            cliCursor.show();

            let command = "";
            let count = 2;

            command = readlineSync.question(chalk`{bold {blueBright.underline ${hostname}} as {cyanBright ban-server}${code !== 0
                ? chalk.bold(" stopped with " + chalk.redBright(code))
                : ""}}\n {magentaBright ${figures.pointer}${code !== 0 ? chalk.redBright(figures.pointer)
                : chalk.blueBright(figures.pointer)}${figures.pointer}} `).trim();

            while (Quotes.check(command)) {
                command += " " + readlineSync.question(chalk`   {blueBright ${figures.pointer}}     `).trim();
                count++;
            }

            if (command.trim() === "" || [ "#", "//", ";" ].some(value => command.trim().startsWith(value))) {
                return this.use()(0);
            }

            while (!command.endsWith(";")) {
                command += " " + readlineSync.question(chalk`   {greenBright ${figures.pointer}}     `).trim();
                count++;
            }

            cliCursor.hide();

            process.stdout.moveCursor(0, -count);
            process.stdout.clearLine(0);
            process.stdout.moveCursor(0, count);

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

                logger.error(error.message);
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
