import Position from "../../../lang/position";

import ParsingError from "./base";

export default class NaNError extends ParsingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Not a number.", startPosition, endPosition);
    }
}
