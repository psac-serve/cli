import Token from "../../tokens";

import Node from "./base";

export default class VariableAccessNode extends Node {
    public startPosition = this.name.startPosition;
    public endPosition = this.name.endPosition;

    public constructor(public name: Token) {
        super(name);
    }

    public toString() {
        return `ACCESS:${this.name.type}:${this.name.value}`;
    }
}
