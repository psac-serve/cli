import Position from "../../../lang/position";

import ExpectedError from "./expected";

export default class ExpectedNumberError extends ExpectedError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super([ "number" ], startPosition, endPosition);
    }
}
