import { __ } from "i18n";

/**
 * Use this error when the module not found in loaded modules.
 */
export default class ModuleNotFoundError extends Error {
    /**
     * Constructor.
     */
    public constructor() {
        super(__("The module not found in loaded modules."));
    }
}
