import Position from "../../../lang/position";

import LexingError from "./base";

export default class InvalidOperatorError extends LexingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Invalid operator.", startPosition, endPosition);
    }
}
