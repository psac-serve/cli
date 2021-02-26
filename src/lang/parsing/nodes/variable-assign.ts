import Token from "../../tokens";

import Node from "./base";

export default class VariableAssignNode extends Node {
    public startPosition = this.name.startPosition;
    public endPosition = this.valueNode.endPosition;

    public constructor(public name: Token, public valueNode: Node, public isConst: boolean) {
        super(name);
    }

    public toString() {
        return `ASSIGN-${this.isConst ? "CONST" : "VARIABLE"}:${this.name.value}:${this.valueNode.toString()}`;
    }
}
