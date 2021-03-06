import Position from "../../position";

import Node from "./base";

export default class WhileNode extends Node {
    public constructor(
        public condition: Node,
        public body: Node,
        public startPosition: Position | undefined = condition.startPosition,
        public endPosition: Position | undefined = body.endPosition
    ) {
        super(condition.token);
    }

    public toString(): string {
        return `WHILE:${this.condition.toString()} -> ${this.body.toString()}`;
    }
}
