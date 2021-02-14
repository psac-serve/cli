import { __ } from "i18n";

/**
 * Use this error when subcommand not found.
 */
export default class SubCommandNotFoundError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("Subcommand not found."));
    }
}
