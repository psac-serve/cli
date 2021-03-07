import Context from "../../../lang/interpreter/context";
import Position from "../../../lang/position";

import RuntimeError from "../../lang/runtime/base";

export default class IllegalOperationError extends RuntimeError {
    public constructor(public context: Context, public startPosition: Position, public endPosition: Position) {
        super("Illegal operation.", context, startPosition, endPosition);
    }
}
