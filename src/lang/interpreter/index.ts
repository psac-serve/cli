import Node from "../parsing/nodes/base";

import Interpreter from "./interpreter";

import Context from "./context";

const runInterpreter = (node: Node) => {
    const
        interpreter = new Interpreter(),
        context = new Context("<program>");

    return interpreter.visit(node, context);
};

export default runInterpreter;
