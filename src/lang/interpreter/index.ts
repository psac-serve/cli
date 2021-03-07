import Node from "../parsing/nodes/base";

import SymbolTable from "../symbol-table";

import Interpreter from "./interpreter";

import Context from "./context";

const symbolTable = new SymbolTable();

const runInterpreter = (node: Node) => {
    const
        interpreter = new Interpreter(),
        context = new Context("<program>", undefined, undefined, symbolTable);

    return interpreter.visit(node, context);
};

export default runInterpreter;
