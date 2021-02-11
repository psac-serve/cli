import { __ } from "i18n";

export default class BackgroundViolationError extends Error 
{
    constructor() 
    {
        super(__("Detected violation on background processing."));
    }
}
