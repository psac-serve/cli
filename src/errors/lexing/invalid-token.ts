import Position from "../../lang/lexing/position";

import LexingError from "./base";

export default class InvalidTokenError extends LexingError {
    public constructor(invalidToken: string, public startPosition: Position, public endPosition: Position) {
        super(`Invalid token '${invalidToken}'`, startPosition, endPosition);
    }
}
