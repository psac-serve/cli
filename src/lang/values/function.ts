import Node from "../parsing/nodes/base";

import Context from "../interpreter/context";
import Interpreter from "../interpreter/interpreter";
import RuntimeResult from "../interpreter/result";

import SymbolTable from "../symbol-table";

import TooManyArgumentsError from "../../errors/interpreter/values/too-many-arguments";
import TooFewArgumentsError from "../../errors/interpreter/values/too-few-arguments";

import Value from "./base";

export default class FunctionValue extends Value {
    public constructor(public body: Node, public argumentNames: string[], public name: string = "<anonymous>") {
        super();
    }

    public execute(arguments_: Value[]) {
        const
            result = new RuntimeResult(),
            interpreter = new Interpreter(),
            newContext = new Context(this.name, this.context, this.startPosition);

        newContext.symbolTable = new SymbolTable((newContext.parent || this.context).symbolTable);

        if (arguments_.length > this.argumentNames.length) {
            return result.failure(new TooManyArgumentsError(this.name, arguments_.length, this.argumentNames.length, this.context, this.startPosition, this.endPosition));
        }

        if (arguments_.length < this.argumentNames.length) {
            return result.failure(new TooFewArgumentsError(this.name, arguments_.length, this.argumentNames.length, this.context, this.startPosition, this.endPosition));
        }

        for (const index of Array.from({ length: arguments_.length }).keys()) {
            const
                argumentName = this.argumentNames[index],
                argumentValue = arguments_[index].setContext(newContext);

            newContext.symbolTable.set(argumentName, argumentValue, false);
        }

        const value = interpreter.visit(this.body, newContext);

        if (result.error) {
            return result;
        }

        return result.success(value);
    }

    public copy() {
        return new FunctionValue(this.body, this.argumentNames, this.name).setContext(this.context).setPosition(this.startPosition, this.endPosition);
    }

    public toString() {
        return `[Function ${this.name}]`;
    }
}
