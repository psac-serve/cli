import Position from "../../../lang/position";

import LexingError from "./base";

export default class ExpectedCharacterError extends LexingError {
    public constructor(character: string, public startPosition: Position, public endPosition: Position) {
        super(`Expected ${character}.`, startPosition, endPosition);
    }
}
