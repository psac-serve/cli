import Token from "../../tokens";

import Position from "../../position";

import Node from "./base";

export default class NumberNode extends Node {
    startPosition?: Position
    endPosition?: Position

    public constructor(public token: Token) {
        super(token);

        this.startPosition = token.startPosition;
        this.endPosition = token.endPosition;
    }

    public toString() {
        return `${this.token}`;
    }
}
