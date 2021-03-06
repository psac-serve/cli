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
        let result = "IF:";

        if (this.cases.length === 1) {
            const [ condition, expression ] = this.cases[0];

            result += `${condition.toString()} -> ${expression.toString()}`;
        } else {
            result += "[\n" + this.cases.map(([ condition, expression ], index, { length }) => `    ${condition.toString()} -> ${expression.toString()}${index === length - 1 ? "" : ","}`).join("\n");

            result += "\n]";
        }

        if (this.elseCase) {
            result += `,\nELSE:${this.elseCase.toString()}`;
        }

        return result;
    }
}
