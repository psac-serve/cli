import { __ } from "i18n";

export default class KeyboardInterruptError extends Error {
    public constructor() {
        super(__("Interrupt signal received."));
    }
}
