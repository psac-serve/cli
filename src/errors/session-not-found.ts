import { __ } from "i18n";

export default class SessionNotFoundError extends Error {
    constructor() {
        super(__("Specified session not found."));
    }
}
