import { __ } from "i18n";

export default class CommandNotFoundError extends Error 
{
    constructor() 
    {
        super(__("Command not found."));
    }
}

