import Token from "../../tokens";
import Node from "./base";

export default class UnaryOperationNode extends Node {
    public constructor(public operationToken: Token, public node: Node) {
        super(operationToken);
    }

    public toString() {
        return `(${this.operationToken}, ${this.node.toString()})`;
    }
}
