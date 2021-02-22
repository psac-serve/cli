import ParsingError from "./base";
import Position from "../../lang/position";

export default class ExpectedOperatorError extends ParsingError {
    public constructor(public startPosition?: Position, public endPosition?: Position) {
        super("Expected operator.", startPosition, endPosition);
    }
}
