import { __ } from "i18n";

/**
 * Use this error when no sessions found.
 */
export default class NoSessionsError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("No sessions found."));
    }
}
