import Position from "../../../lang/position";
import LangError from "../base";

export default class LexingError extends LangError {
    protected constructor(message: string, public startPosition: Position, public endPosition: Position) {
        super(message, startPosition, endPosition);
    }
}
