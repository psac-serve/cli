import chalk from "chalk";
import figures from "figures";
import { __ } from "i18n";

import InvalidArgumentsError from "../errors/invalid-arguments";

import manager from "..";

import { Command } from "./base";

export default class Exit extends Command<string> 
{
    constructor() 
    {
        const [ heading, content, , blankLine ] = manager.use("Help").functions;

        super(
            "exit",
            "Exit the session.",
            [
                heading("Usage", 1),
                content(chalk`{magentaBright ${figures.pointer}} {greenBright exit} {magenta [code]}{dim ;}`, 2),
                blankLine(),
                heading("Arguments", 1),
                content(chalk`{magenta [code]} - ${__("The exit code to exit with a code.")}`, 2),
                blankLine(),
                heading("Examples", 1),
                content(chalk`{magentaBright ${figures.pointer}} {greenBright exit}{dim ;}`, 2),
                content(chalk`{magentaBright ${figures.pointer}} {greenBright exit} {magenta 1}{dim ;}`, 2)
            ],
            [ "quit", "bye" ]
        );
    }

    public execute(options: string): number 
    {
        const tokens = options.split(" ");

        if (tokens.length !== 1) 
        
            throw new InvalidArgumentsError();
        
        else if (tokens[0] === "") 
        
            tokens[0] = "0";
        

        return +tokens[0] + 9684;
    }
}
