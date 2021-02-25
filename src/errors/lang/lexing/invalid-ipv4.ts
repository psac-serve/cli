import Position from "../../../lang/position";

import LexingError from "./base";

export default class InvalidIPv4Error extends LexingError {
    public constructor(public startPosition: Position, public endPosition: Position) {
        super("Invalid IPv4 address.", startPosition, endPosition);
    }
}
