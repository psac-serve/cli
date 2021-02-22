import Token, { TokenType } from "../tokens";

import Node from "./nodes/base";
import NumberNode from "./nodes/number";

export default class ParseResult {
    public constructor(public error?: Error, public node?: Node) {}

    public register(result: ParseResult | Token) {
        if (result instanceof ParseResult) {
            if (result.error) {
                this.error = result.error;
            }

            return result.node || new NumberNode(new Token(TokenType.number));
        }

        return result;
    }

    public success(node: Node) {
        this.node = node;

        return this;
    }

    public failure(error: Error) {
        this.error = error;

        return this;
    }
}
