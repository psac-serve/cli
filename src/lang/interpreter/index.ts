import Node from "../parsing/nodes/base";

import Interpreter from "./interpreter";

import Context from "./context";

import globalSymbolTable from "./global-symbol";

const runInterpreter = (node: Node) => {
    const
        interpreter = new Interpreter(),
        context = new Context("<program>", undefined, undefined, globalSymbolTable);

    return interpreter.visit(node, context);
};

export default runInterpreter;
