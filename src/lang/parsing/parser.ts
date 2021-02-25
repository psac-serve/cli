import ExpectedNumberError from "../../errors/lang/parsing/expected-number";

import Token, { TokenType } from "../tokens";

import ExpectedOperatorError from "../../errors/lang/parsing/expected-operator";
import ExpectedRParenError from "../../errors/lang/parsing/expected-rparen";

import Node from "./nodes/base";
import NumberNode from "./nodes/number";
import BinaryOperationNode from "./nodes/binary-operation";

import ParseResult from "./result";
import UnaryOperationNode from "./nodes/unary-operation";

export default class Parser {
    public constructor(public tokens: Token[], public tokenIndex = -1, public currentToken: Token = tokens[++tokenIndex]) {}

    public advance() {
        this.currentToken = this.tokens[++this.tokenIndex];

        return this.currentToken;
    }

    public parse() {
        const result = this.expression();

        if (!result.error && this.currentToken.type !== TokenType.eof) {
            return result.failure(new ExpectedOperatorError(this.currentToken.startPosition, this.currentToken.endPosition));
        }

        return result;
    }

    public factor() {
        const
            result = new ParseResult(),
            token = this.currentToken;

        if (token.type === TokenType.operator && (token.value === "PLUS" || token.value === "MINUS")) {
            result.register(this.advance());

            const factor = result.register(this.factor());

            if (!(factor instanceof Node)) {
                throw new TypeError("Omg!");
            }

            if (result.error) {
                return result;
            }

            return result.success(new UnaryOperationNode(token, factor));
        } else if (token.type === TokenType.number) {
            result.register(this.advance());

            return result.success(new NumberNode(token));
        } else if (token.type === TokenType.operator && token.value === "LPAREN") {
            result.register(this.advance());

            const expression = result.register(this.expression());

            if (!(expression instanceof Node)) {
                throw new TypeError("Omg!");
            }

            if (result.error) {
                return result;
            }

            if (this.currentToken.type === TokenType.operator && this.currentToken.value === "RPAREN") {
                result.register(this.advance());

                return result.success(expression);
            } else {
                return result.failure(new ExpectedRParenError(this.currentToken.startPosition, this.currentToken.endPosition));
            }
        }

        return result.failure(new ExpectedNumberError(token.startPosition, token.endPosition));
    }

    public term() {
        return this.binaryOperation(this.factor, "MUL", "DIV", "MOD");
    }

    public expression() {
        return this.binaryOperation(this.term, "PLUS", "MINUS");
    }

    public binaryOperation(function_: () => ParseResult, ...operators: string[]) {
        const result = new ParseResult();

        let left = result.register(function_.call(this));

        if (!(left instanceof Node)) {
            throw new TypeError("Omg!");
        }

        if (result.error) {
            return result;
        }

        while (operators.includes(typeof this.currentToken.value === "string" ? this.currentToken.value : "")) {
            const operatorToken = this.currentToken;

            result.register(this.advance());

            const right = result.register(function_.call(this));

            if (!(right instanceof Node)) {
                throw new TypeError("Omg!");
            }

            if (result.error) {
                return result;
            }

            left = new BinaryOperationNode(left, operatorToken, right);
        }

        return result.success(left);
    }
}
