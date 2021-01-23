import { __ } from "i18n";

export default class SubCommandNotFoundError extends Error 
{
    constructor() 
    {
        super(__("Subcommand not found."));
    }
}
