import chalk from "chalk";
import figures from "figures";
import readlineSync from "readline-sync";
import {__} from "i18n";

import manager from "..";

import Module from "./base";

export default class Prompt extends Module {
    constructor() {
        super("Prompt", __("Show beauty prompts."));
    }

    init(): Promise<void> {
        return Promise.resolve();
    }

    use(): (code: number) => void {
        return (code: number) => {
            const parsedArguments = manager.use("Arguments Manager");

            process.stdout.write(chalk`{bold {blueBright.underline ${new URL(parsedArguments.host).host}} as {cyanBright ban-server}}\n {magentaBright ${figures.pointer}${code !== 0 ? chalk.redBright(figures.pointer) : chalk.blueBright(figures.pointer)}${figures.pointer}} `);

            let command = "";

            command = readlineSync.question("").trim();

            while (!command.endsWith(";")) {
                process.stdout.write(chalk`   {greenBright ${figures.pointer}}    `);
                command += " " + readlineSync.question("").trim();
            }

            do {
                command = command.slice(0, -1);
            } while (command.endsWith(";"));

            const stopCode = manager.use("Command").execute(command);

            if (stopCode >= 9684) {
                console.log(chalk`{greenBright Good bye.}`);
                process.exit(stopCode - 9684);
            }

            return this.use()(stopCode);
        };
    }

    close(): Promise<void> {
        return Promise.resolve();
    }
}
