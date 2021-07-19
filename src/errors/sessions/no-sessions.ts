import { t } from "../../translate.ts";

export default class NoSessionsError extends Error {
    constructor() {
        super(t("errors.sessions.no-sessions"));
    }
}
