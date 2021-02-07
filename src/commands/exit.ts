import chalk from "chalk";
import figures from "figures";
import { __ } from "i18n";

import InvalidArgumentsError from "../errors/invalid-arguments";

import CliComponents from "../utils/cli/components";

import { Command } from "./base";


export default class Exit extends Command<string> 
{
    constructor() 
    {
        super(
            "exit",
            "Exit the session.",
            [
                CliComponents.heading("Usage", 1),
                CliComponents.content(chalk`{magentaBright ${figures.pointer}} {greenBright exit} {magenta [code]}{dim ;}`, 2),
                CliComponents.blankLine(),
                CliComponents.heading("Arguments", 1),
                CliComponents.content(chalk`{magenta [code]} - ${__("The exit code to exit with a code.")}`, 2),
                CliComponents.blankLine(),
                CliComponents.heading("Examples", 1),
                CliComponents.content(chalk`{magentaBright ${figures.pointer}} {greenBright exit}{dim ;}`, 2),
                CliComponents.content(chalk`{magentaBright ${figures.pointer}} {greenBright exit} {magenta 1}{dim ;}`, 2)
            ],
            [ "quit", "bye" ]
        );
    }

    public execute(options: string): Promise<number> 
    {
        const tokens = options.split(" ");

        if (tokens.length !== 1) 
        
            throw new InvalidArgumentsError();
        
        else if (tokens[0] === "") 
        
            tokens[0] = "0";
        

        return Promise.resolve(+tokens[0] + 9684);
    }
}
