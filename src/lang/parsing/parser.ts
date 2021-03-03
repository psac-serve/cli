import Token, { TokenType } from "../tokens";

import ExpectedError from "../../errors/lang/parsing/expected";
import ExpectedOperatorError from "../../errors/lang/parsing/expected-operator";
import ExpectedRParenError from "../../errors/lang/parsing/expected-rparen";
import ExpectedIdentifierError from "../../errors/lang/parsing/expected-identifier";

import Node from "./nodes/base";
import NumberNode from "./nodes/number";
import BinaryOperationNode from "./nodes/binary-operation";
import UnaryOperationNode from "./nodes/unary-operation";
import VariableAccessNode from "./nodes/variable-access";
import VariableAssignNode from "./nodes/variable-assign";

import ParseResult from "./result";

export default class Parser {
    public constructor(public tokens: Token[], public tokenIndex = -1, public currentToken: Token = tokens[++tokenIndex], public patternMatching = false, public matchingNode?: Node) {}

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

    public atom() {
        const
            result = new ParseResult(),
            token = this.currentToken;

        if (token.type === TokenType.number) {
            result.registerAdvancement();
            this.advance();

            return result.success(new NumberNode(token));
        } else if (token.type === TokenType.identifier) {
            result.registerAdvancement();
            this.advance();

            return result.success(new VariableAccessNode(token));
        } else if (token.type === TokenType.operator && token.value === "LPAREN") {
            result.registerAdvancement();
            this.advance();

            const expression = result.register(this.expression());

            if (result.error) {
                return result;
            }

            if (this.currentToken.type === TokenType.operator && this.currentToken.value === "RPAREN") {
                result.registerAdvancement();
                this.advance();

                return result.success(expression);
            } else {
                return result.failure(new ExpectedRParenError(this.currentToken.startPosition, this.currentToken.endPosition));
            }
        }

        return result.failure(new ExpectedError([ "number", "identifier", "+", "-", "(" ], token.startPosition, token.endPosition));
    }

    public power(): ParseResult {
        return this.binaryOperation(this.atom, [ "POW" ], this.factor);
    }

    public factor() {
        const
            result = new ParseResult(),
            token = this.currentToken;

        if (token.type === TokenType.operator && (token.value === "PLUS" || token.value === "MINUS")) {
            result.registerAdvancement();
            this.advance();

            const factor = result.register(this.factor());

            if (result.error) {
                return result;
            }

            return result.success(new UnaryOperationNode(token, factor));
        }

        return this.power();
    }

    public term() {
        return this.binaryOperation(this.factor, [ "MUL", "DIV", "MOD" ]);
    }

    public expression() {
        const
            result = new ParseResult(),
            token = this.currentToken;

        if (token.type === TokenType.keyword && (token.value === "const" || token.value === "var")) {
            const isConstant = token.value === "const";

            result.registerAdvancement();
            this.advance();

            if (this.currentToken.type !== TokenType.identifier) {
                return result.failure(new ExpectedIdentifierError(this.currentToken.startPosition, this.currentToken.endPosition));
            }

            const name = this.currentToken;

            result.registerAdvancement();
            this.advance();

            // @ts-ignore
            if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "EQ") {
                return result.failure(new Error("Sorry, this is working in progress"));
            }

            result.registerAdvancement();
            this.advance();

            const expression = result.register(this.expression());

            if (result.error) {
                return result;
            }

            return result.success(new VariableAssignNode(name, expression, isConstant));
        }

        const node = result.register(this.binaryOperation(this.term, [ "PLUS", "MINUS" ]));

        if (result.error) {
            return result.failure(new ExpectedError([ "number", "identifier", "var", "const", "+", "-", "(" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        return result.success(node);
    }

    public binaryOperation(functionA: () => ParseResult, operators: string[], functionB?: () => ParseResult) {
        if (!functionB) {
            functionB = functionA;
        }

        const result = new ParseResult();

        let left = result.register(functionA.call(this));

        if (result.error) {
            return result;
        }

        while (operators.includes(typeof this.currentToken.value === "string" ? this.currentToken.value : "")) {
            const operatorToken = this.currentToken;

            result.registerAdvancement();
            this.advance();

            const right = result.register(functionB.call(this));

            if (result.error) {
                return result;
            }

            left = new BinaryOperationNode(left, operatorToken, right);
        }

        return result.success(left);
    }
}
