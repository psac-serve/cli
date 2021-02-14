import { __ } from "i18n";

/**
 * Use this error when the arguments are invalid.
 */
export default class InvalidArgumentsError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("Invalid arguments."));
    }
}
