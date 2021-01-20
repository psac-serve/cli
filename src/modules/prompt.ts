import chalk from "chalk";
import figures from "figures";
import readlineSync from "readline-sync";
import { __ } from "i18n";

import manager from "..";

import Module from "./base";

export default class Prompt extends Module 
{
    constructor() 
    {
        super("Prompt", "Show beauty prompts.");
    }

    init(): Promise<void> 
    {
        this.enabled = true;

        return Promise.resolve();
    }

    use(): (code: number) => void 
    {
        return (code: number) => 
        {
            const parsedArguments = manager.use("Arguments Manager");

            process.stdout.write(chalk`{bold {blueBright.underline ${parsedArguments.host}} as {cyanBright ban-server}${code !== 0 ? chalk.bold(" stopped with " + chalk.redBright(code)) : ""}}\n {magentaBright ${figures.pointer}${code !== 0 ? chalk.redBright(figures.pointer) : chalk.blueBright(figures.pointer)}${figures.pointer}} `);

            let command = "";

            command = readlineSync.question("").trim();

            while (!command.endsWith(";")) 
            {
                process.stdout.write(chalk`   {greenBright ${figures.pointer}}     `);
                command += " " + readlineSync.question("").trim();
            }

            do 
            
                command = command.slice(0, -1);
            while (command.endsWith(";"));

            let stopCode;

            try 
            {
                stopCode = manager.use("Command").commands(command.trim());
            }
            catch (error) 
            {
                console.log(chalk`{bgRedBright.black  ERROR } ` + chalk.redBright(__(error.message)));

                stopCode = 1;
            }

            if (stopCode >= 9684) 
            
                manager.exit(stopCode - 9684);
            

            if (stopCode == -1) 
            
                console.log(chalk`{bgRedBright.black  ERROR } ` + chalk.redBright(__("Command not found.")));
            

            return this.use()(stopCode);
        };
    }

    close(): Promise<void> 
    {
        this.enabled = false;

        return Promise.resolve();
    }
}
