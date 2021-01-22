import { __ } from "i18n";

export default class SubCommandNotFound extends Error {
    constructor() {
        super(__("Subcommand not found."));
    }
}
