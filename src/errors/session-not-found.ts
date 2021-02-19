import { __ } from "i18n";

/**
 * Use this error when session not found.
 */
export default class SessionNotFoundError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("Specified session not found."));
    }
}
