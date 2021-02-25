import Position from "../../../lang/position";

import LexingError from "../lexing/base";

export default class ParsingError extends LexingError {
    protected constructor(message: string, public startPosition: Position, public endPosition: Position) {
        super(message, startPosition, endPosition);
    }
}
