import Token, { TokenType } from "../tokens";

import Node from "./nodes/base";
import NumberNode from "./nodes/number";

export default class ParseResult {
    public constructor(public error?: Error, public node?: Node, public advanceCount = 0) {}

    public registerAdvancement() {
        this.advanceCount++;
    }

    public register(result: ParseResult) {
        this.advanceCount += result.advanceCount;

        if (result.error) {
            this.error = result.error;
        }

        return result.node || new NumberNode(new Token(TokenType.number));
    }

    public success(node: Node) {
        this.node = node;

        return this;
    }

    public failure(error: Error) {
        if (!this.error || this.advanceCount === 0) {
            this.error = error;
        }

        return this;
    }
}
