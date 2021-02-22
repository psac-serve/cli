import chalk from "chalk";
import repeat from "repeat-string";
import { __ } from "i18n";

import manager from "../../manager-instance";

export default class LexingError extends Error {
    protected constructor(message: string, public line: string, public row: number, public startColumn: number, public endColumn: number) {
        super(message);
    }

    public toString(): string {
        if (this.startColumn > this.endColumn) {
            [ this.startColumn, this.endColumn ] = [ this.endColumn, this.startColumn ];
        }

        const { columns } = manager;

        return chalk`{bold.redBright ${__("Error")}} - {whiteBright ${this.message}}
 {bold at} {cyan ${this.row}}:{magenta ${this.startColumn == this.endColumn
    ? this.startColumn
    : chalk`{green ${this.startColumn}}{white.bold -}{magenta ${this.endColumn}}`}}
 {dim ${repeat("-", columns - 1)}}
 |
 | ${this.line}
 | ${repeat(" ", this.startColumn - 1)}${this.startColumn == this.endColumn
    ? "^"
    : repeat("~", this.endColumn - this.startColumn)}
 {dim ${repeat("-", columns - 1)}}`;
    }
}
