import { __ } from "i18n";

/**
 * Use this error when the command not found.
 */
export default class CommandNotFoundError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("Command not found."));
    }
}
