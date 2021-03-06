import Token from "../../tokens";

import Position from "../../position";

import Node from "./base";

export default class ForNode extends Node {
    public constructor(
        public variableNameToken: Token,
        public startValue: Node,
        public endValue: Node,
        public body: Node,
        public stepValue?: Node,
        public startPosition: Position | undefined = variableNameToken.startPosition,
        public endPosition: Position | undefined = body.endPosition
    ) {
        super(variableNameToken);
    }

    public toString(): string {
        return `FOR:[ ${this.variableNameToken.value} <- ${this.startValue.toString()} to ${this.endValue.toString()}${this.stepValue ? ` step ${this.stepValue.toString()}` : ""} ] -> ${this.body.toString()}`;
    }
}
