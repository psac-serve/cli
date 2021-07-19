import { t } from "../../translate.ts";

export default class SessionNotFoundError extends TypeError {
    constructor() {
        super(t("errors.sessions.session-not-found"));
    }
}
