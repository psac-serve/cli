import { __ } from "i18n";

export default class SessionLengthTooShortError extends Error {
    public constructor() {
        super(__("Too short length of sessions."));
    }
}
