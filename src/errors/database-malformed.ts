import { __ } from "i18n";

export default class DatabaseMalformedError extends Error 
{
    constructor() 
    {
        super(__("Database file malformed."));
    }
}
