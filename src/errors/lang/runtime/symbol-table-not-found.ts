import Context from "../../../lang/interpreter/context";

import Position from "../../../lang/position";

import RuntimeError from "./base";

export default class SymbolTableNotFoundError extends RuntimeError {
    public constructor(public context: Context, public startPosition: Position, public endPosition: Position) {
        super("Symbol table not found.", context, startPosition, endPosition);
    }
}
