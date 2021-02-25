import Token from "../../tokens";

import Node from "./base";

export default class UnaryOperationNode extends Node {
    public constructor(public operatorToken: Token, public node: Node, public startPosition = operatorToken.startPosition, public endPosition = node.endPosition) {
        super(operatorToken);
    }

    public toString() {
        return `(${this.operatorToken}, ${this.node.toString()})`;
    }
}
