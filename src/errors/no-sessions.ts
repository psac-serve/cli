import { __ } from "i18n";

export default class NoSessionsError extends Error {
    constructor() {
        super(__("No sessions found."));
    }
}
