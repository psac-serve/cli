import chalk from "chalk";
import { __ } from "i18n";
import repeat from "repeat-string";

import manager from "../../manager-instance";

import Position from "../../lang/position";

export default class ParsingError extends Error {
    protected constructor(message: string, public startPosition?: Position, public endPosition?: Position) {
        super(message);

        if (endPosition) {
            this.endPosition = endPosition.copy();
        }
    }

    public toString(): string {
        if (this.startPosition && this.endPosition && this.startPosition.column > this.endPosition.column + 1) {
            [ this.startPosition.column, this.endPosition.column ] = [ this.endPosition.column, this.startPosition.column ];
        }

        const { columns } = manager;

        return chalk`{bold.redBright ${__("Error")}} - {whiteBright ${this.message}}${
            this.startPosition && this.endPosition
                ? chalk`\n {bold at} {blue.underline ${this.endPosition.filename}}:{cyan ${this.endPosition.line}}:{magenta ${this.startPosition.column == this.endPosition.column
                    ? this.startPosition.column
                    : chalk`{green ${this.startPosition.column}}{white.bold -}{magenta ${this.endPosition.column}}`}}`
                : ""
        }
 {dim ${repeat("-", columns - 1)}}
 | ${this.endPosition ? this.endPosition.filetext.split("\n")[this.endPosition.line - 1] || "" : ""}
 | ${this.endPosition ? this.endPosition.filetext.split("\n")[this.endPosition.line] : ""}
 | ${this.startPosition && this.endPosition ? repeat(" ", this.startPosition.column - 1) : ""}${this.startPosition && this.endPosition ? (this.startPosition.column == this.endPosition.column
    ? "^"
    : repeat("~", this.endPosition.column - this.startPosition.column === 1 ? 1 + this.endPosition.column - this.startPosition.column : this.endPosition.column - this.startPosition.column)) : ""}
 | ${this.endPosition ? this.endPosition.filetext.split("\n")[this.endPosition.line + 1] || "" : ""}
 {dim ${repeat("-", columns - 1)}}`;
    }
}
