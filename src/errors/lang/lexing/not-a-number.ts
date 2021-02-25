import Position from "../../../lang/position";

import LexingError from "./base";

export default class NaNError extends LexingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Invalid number.", startPosition, endPosition);
    }
}
