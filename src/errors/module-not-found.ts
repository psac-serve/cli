import { __ } from "i18n";

export default class ModuleNotFoundError extends Error 
{
    constructor() 
    {
        super(__("The module not found in loaded modules."));
    }
}

