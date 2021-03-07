import Node from "./base";

export default class CallNode extends Node {
    public constructor(public nodeToCall: Node, public argumentNodes: Node[]) {
        super(nodeToCall.token);

        this.startPosition = nodeToCall.startPosition;

        if (argumentNodes.length > 0) {
            this.endPosition = argumentNodes[argumentNodes.length - 1].endPosition;
        } else {
            this.endPosition = nodeToCall.endPosition;
        }
    }

    public toString(): string {
        return `CALL:${this.nodeToCall.toString()} -- [${this.argumentNodes.length === 0 ? "" : "\n    "}${this.argumentNodes.map(argumentNode => `\n    ${argumentNode.toString()}`).join(",").trim()}${this.argumentNodes.length === 0 ? "" : "\n"}]`;
    }
}
