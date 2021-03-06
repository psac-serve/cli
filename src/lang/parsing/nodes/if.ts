import Position from "../../position";

import Node from "./base";

export default class IfNode extends Node {
    public constructor(
        public cases: Node[][],
        public elseCase?: Node,
        public startPosition: Position | undefined = cases[0][0].startPosition,
        public endPosition: Position | undefined = (elseCase && elseCase.startPosition) || cases[cases.length - 1][0].endPosition
    ) {
        super(cases[0][0].token);
    }

    public toString(): string {
        return "IF";
    }
}
