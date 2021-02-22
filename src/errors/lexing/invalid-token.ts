import LexingError from "./base";

export default class InvalidTokenError extends LexingError {
    public constructor(invalidToken: string, public line: string, public row: number, public startColumn: number, public endColumn: number) {
        super(`Invalid token '${invalidToken}'`, line, row, startColumn, endColumn);
    }
}
