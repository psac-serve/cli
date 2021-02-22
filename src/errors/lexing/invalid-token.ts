import { Position } from "../../utils/lexing";

import LexingError from "./base";

export default class InvalidTokenError extends LexingError {
    public constructor(invalidToken: string, public startPosition: Position, public endPosition: Position) {
        super(`Invalid token '${invalidToken}'`, startPosition, endPosition);
    }
}
