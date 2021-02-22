import Token from "../../tokens";

import Node from "./base";

export default class NumberNode extends Node {
    public constructor(public token: Token) {
        super(token);
    }

    public toString() {
        return `${this.token}`;
    }
}
