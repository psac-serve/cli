import Context from "../../../lang/interpreter/context";
import Position from "../../../lang/position";

import RuntimeError from "../../lang/runtime/base";

export default class TooManyArgumentsError extends RuntimeError {
    public constructor(public name: string, public argumentsLength: number, public argumentNamesLength: number, public context: Context, public startPosition: Position, public endPosition: Position) {
        super(`${argumentsLength - argumentNamesLength} too many arguments passed into '${name}'.`, context, startPosition, endPosition);
    }
}
