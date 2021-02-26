import Position from "../../../lang/position";

import ExpectedError from "./expected";

export default class ExpectedOperatorError extends ExpectedError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super([ "operator" ], startPosition, endPosition);
    }
}
