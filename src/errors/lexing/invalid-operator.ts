import Position from "../../lang/position";

import LexingError from "./base";

export default class InvalidOperatorError extends LexingError {
    constructor(public startPosition: Position, public endPosition: Position) {
        super("Invalid operator.", startPosition, endPosition);
    }
}
