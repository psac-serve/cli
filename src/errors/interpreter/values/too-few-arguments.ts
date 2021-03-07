import Context from "../../../lang/interpreter/context";
import Position from "../../../lang/position";

import RuntimeError from "../../lang/runtime/base";

export default class TooFewArgumentsError extends RuntimeError {
    public constructor(public name: string, public argumentsLength: number, public argumentNamesLength: number, public context: Context, public startPosition: Position, public endPosition: Position) {
        super(`${argumentNamesLength - argumentsLength} too few arguments passed into '${name}'.`, context, startPosition, endPosition);
    }
}
