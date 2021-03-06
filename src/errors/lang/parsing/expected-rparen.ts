import Position from "../../../lang/position";

import ExpectedError from "./expected";

export default class ExpectedRParenError extends ExpectedError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super([ ")" ], startPosition, endPosition);
    }
}