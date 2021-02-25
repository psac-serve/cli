import Token from "../../tokens";

import Node from "./base";

export default class BinaryOperationNode extends Node {
    public constructor(public leftNode: Node, public operatorToken: Token, public rightNode: Node, public startPosition = leftNode.startPosition, public endPosition = rightNode.endPosition) {
        super(operatorToken);
    }

    public toString() {
        return `(${this.leftNode.toString()}, ${this.operatorToken.toString()}, ${this.rightNode.toString()})`;
    }
}
