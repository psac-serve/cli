import Position from "../../position";

import Token, { TokenType } from "../../tokens";

import Node from "./base";

export default class NullNode extends Node {
    public constructor(
        public startPosition: Position | undefined,
        public endPosition: Position | undefined
    ) {
        super(new Token(TokenType.identifier, "null"));
    }

    public toString(): string {
        return "NULL";
    }
}
