import { __ } from "i18n";

export default class KeyboardInterruptError extends Error {
    constructor() {
        super(__("Interrupt signal received."));
    }
}
