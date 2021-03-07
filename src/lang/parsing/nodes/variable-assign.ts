import Token from "../../tokens";

import Node from "./base";

export default class VariableAssignNode extends Node {
    public startPosition = this.name.startPosition;
    public endPosition: any = this.valueNode?.endPosition;

    public constructor(public name: Token, public valueNode: Node | undefined, public isConst: boolean) {
        super(name);
    }

    public toString() {
        return `${this.valueNode ? "INIT" : "DEFINE"}-${this.isConst ? "CONST" : "VARIABLE"}:${this.name.value}${this.valueNode ? " <- " : ""}${this.valueNode?.toString() || ""}`;
    }
}
