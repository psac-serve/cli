import { __ } from "i18n";

/**
 * Use this error when modules is not enabled.
 */
export default class ModuleNotEnabledError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("This module is not enabled!"));
    }
}
