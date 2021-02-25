import chalk from "chalk";
import repeat from "repeat-string";
import { __ } from "i18n";

import manager from "../../../manager-instance";

import Position from "../../../lang/position";

import Context from "../../../lang/interpreter/context";

import LangError from "../base";

export default class RuntimeError extends LangError {
    protected constructor(message: string, public context: Context, public startPosition: Position, public endPosition: Position) {
        super(message, startPosition, endPosition);
    }

    public toString(): string {
        const { columns } = manager;

        return chalk`{bold.redBright ${__("Runtime Error")}} - {whiteBright ${this.message}}\n${this.generateStacktrace()}
 {dim ${repeat("-", columns - 1)}}
 | ${this.endPosition.fileText.split("\n")[this.endPosition.line - 1] || ""}
 | ${this.endPosition.fileText.split("\n")[this.endPosition.line]}
 | ${this.startPosition && this.endPosition ? repeat(" ", this.startPosition.column - 1) : ""}${this.startPosition && this.endPosition ? (this.startPosition.column == this.endPosition.column
    ? "^"
    : repeat("~", this.endPosition.column - this.startPosition.column === 1 ? 1 + this.endPosition.column - this.startPosition.column : this.endPosition.column - this.startPosition.column)) : ""}
 | ${this.endPosition ? this.endPosition.fileText.split("\n")[this.endPosition.line + 1] || "" : ""}
 {dim ${repeat("-", columns - 1)}}`;
    }

    private generateStacktrace(): string {
        if (this.startPosition.column > this.endPosition.column + 1) {
            [ this.startPosition.column, this.endPosition.column ] = [ this.endPosition.column, this.startPosition.column ];
        }

        let result = "";

        let
            position: Position | undefined = this.startPosition,
            context: Context | undefined = this.context;

        while (context) {
            if (!position || !this.endPosition) {
                continue;
            }

            result = chalk` {bold at} {blue.underline ${position.filename}}:{cyan ${position.line}}:{magenta ${position.column == this.endPosition.column
                ? position.column
                : chalk`{green ${position.column}}{white.bold -}{magenta ${this.endPosition.column}}`}}, {bold in} {cyanBright ${context.displayName}}\n` + result;

            position = context.parentEntryPosition;
            context = context.parent;
        }

        return result;
    }
}
