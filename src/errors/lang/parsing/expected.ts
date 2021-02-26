import Position from "../../../lang/position";

import ParsingError from "./base";

export default class ExpectedError extends ParsingError {
    public constructor(public expected: string[], public startPosition: Position, public endPosition: Position) {
        super(`Expected ${expected.map((token, index, { length }) => (length !== 1 && index == length - 1 ? `or '${token}'` : `'${token}',`)).join(" ")}.`, startPosition, endPosition);
    }
}
