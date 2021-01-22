import { __ } from "i18n";

export default class ModuleNotEnabledError extends Error {
    constructor() {
        super(__("This module is not enabled!"));
    }
}
