import Position from "../../../lang/position";

import ParsingError from "./base";

export default class NotNullableError extends ParsingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Constant field cannot be nullable.", startPosition, endPosition);
    }
}
