import { __ } from "i18n";

export default class HelpNotFoundError extends Error {
    public constructor() {
        super(__("Cannot find specified help document."));
    }
}

