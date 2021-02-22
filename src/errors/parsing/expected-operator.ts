import Position from "../../lang/position";
import ParsingError from "./base";

export default class ExpectedOperatorError extends ParsingError {
    public constructor(public startPosition?: Position, public endPosition?: Position) {
        super("Expected operator.", startPosition, endPosition);
    }
}
