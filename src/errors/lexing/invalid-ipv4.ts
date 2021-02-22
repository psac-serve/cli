import LexingError from "./base";

export default class InvalidIPv4Error extends LexingError {
    constructor(public line: string, public row: number, public startColumn: number, public endColumn: number) {
        super("Invalid IPv4 address.", line, row, startColumn, endColumn);
    }
}
