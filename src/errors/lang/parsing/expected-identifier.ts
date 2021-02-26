import Position from "../../../lang/position";

import ExpectedError from "./expected";

export default class ExpectedIdentifierError extends ExpectedError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super([ "identifier" ], startPosition, endPosition);
    }
}
