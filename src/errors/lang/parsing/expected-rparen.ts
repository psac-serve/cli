import Position from "../../../lang/position";

import ParsingError from "./base";

export default class ExpectedRParenError extends ParsingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Expected ')'.", startPosition, endPosition);
    }
}
