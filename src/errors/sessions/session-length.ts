import { t } from "../../translate.ts";

export default class SessionLengthTooShortError extends TypeError {
    constructor() {
        super(t("errors.sessions.session-length.short"));
    }
}
