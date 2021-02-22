import LexingError from "./base";

export default class NaNError extends LexingError {
    public constructor(public line: string, public row: number, public startColumn: number, public endColumn: number) {
        super("Invalid number.", line, row, startColumn, endColumn);
    }
}
