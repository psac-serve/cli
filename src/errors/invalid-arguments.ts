import { __ } from "i18n";

export default class InvalidArgumentsError extends Error {
    constructor() {
        super(__("Invalid arguments."));
    }
}
