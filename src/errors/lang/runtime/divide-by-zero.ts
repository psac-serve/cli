import Context from "../../../lang/interpreter/context";

import Position from "../../../lang/position";

import RuntimeError from "./base";

export default class DivideByZeroError extends RuntimeError {
    public constructor(context: Context, startPosition: Position, endPosition: Position) {
        super("Division by zero.", context, startPosition, endPosition);
    }
}
