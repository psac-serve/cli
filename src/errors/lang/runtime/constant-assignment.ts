import RuntimeError from "./base";
import Context from "../../../lang/interpreter/context";
import Position from "../../../lang/position";

export default class ConstantAssignmentError extends RuntimeError {
    public constructor(public context: Context, public startPosition: Position, public endPosition: Position) {
        super("Constant field cannot assign.", context, startPosition, endPosition);
    }
}
