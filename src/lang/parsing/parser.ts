import Token, { TokenType } from "../tokens";

import ExpectedError from "../../errors/lang/parsing/expected";
import ExpectedOperatorError from "../../errors/lang/parsing/expected-operator";
import ExpectedRParenError from "../../errors/lang/parsing/expected-rparen";
import ExpectedIdentifierError from "../../errors/lang/parsing/expected-identifier";

import Node from "./nodes/base";
import NumberNode from "./nodes/number";
import IfNode from "./nodes/if";
import ForNode from "./nodes/for";
import WhileNode from "./nodes/while";
import CallNode from "./nodes/call";
import BinaryOperationNode from "./nodes/binary-operation";
import UnaryOperationNode from "./nodes/unary-operation";
import VariableAccessNode from "./nodes/variable-access";
import VariableAssignNode from "./nodes/variable-assign";
import FunctionDefineNode from "./nodes/function-define";

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
        } else if (token.type === TokenType.keyword && token.value === "if") {
            const ifExpression = result.register(this.ifExpression());

            if (result.error) {
                return result;
            }

            return result.success(ifExpression);
        } else if (token.type === TokenType.keyword && token.value === "for") {
            const forExpression = result.register(this.forExpression());

            if (result.error) {
                return result;
            }

            return result.success(forExpression);
        } else if (token.type === TokenType.keyword && token.value === "while") {
            const whileExpression = result.register(this.whileExpression());

            if (result.error) {
                return result;
            }

            return result.success(whileExpression);
        } else if (token.type === TokenType.keyword && token.value === "func") {
            const functionDefinition = result.register(this.functionDefinition());

            if (result.error) {
                return result;
            }

            return result.success(functionDefinition);
        }

        return result.failure(new ExpectedError([ "number", "identifier", "+", "-", "(", "if", "for", "while", "func" ], token.startPosition, token.endPosition));
    }

    public ifExpression() {
        const
            result = new ParseResult(),
            cases: Node[][] = [];

        let elseCase: Node | undefined;

        if (this.currentToken.type !== TokenType.keyword || this.currentToken.value !== "if") {
            return result.failure(new ExpectedError([ "if" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "LPAREN") {
            return result.failure(new ExpectedError([ "(" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const condition = result.register(this.expression());

        if (result.error) {
            return result;
        }

        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
            return result.failure(new ExpectedRParenError(this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.arrow) {
            return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const expression = result.register(this.expression());

        if (result.error) {
            return result;
        }

        cases.push([ condition, expression ]);

        while (this.currentToken.type === TokenType.keyword && this.currentToken.value === "elif") {
            result.registerAdvancement();
            this.advance();

            const elifCondition = result.register(this.expression());

            if (result.error) {
                return result;
            }

            // @ts-ignore
            if (this.currentToken.type !== TokenType.arrow) {
                return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
            }

            result.registerAdvancement();
            this.advance();

            const elifExpression = result.register(this.expression());

            if (result.error) {
                return result;
            }

            cases.push([ elifCondition, elifExpression ]);
        }

        if (this.currentToken.type === TokenType.keyword && this.currentToken.value === "else") {
            result.registerAdvancement();
            this.advance();

            // @ts-ignore
            if (this.currentToken.type !== TokenType.arrow) {
                return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
            }

            result.registerAdvancement();
            this.advance();

            const elseExpression = result.register(this.expression());

            if (result.error) {
                return result;
            }

            elseCase = elseExpression;
        }

        return result.success(new IfNode(cases, elseCase));
    }

    public forExpression() {
        const result = new ParseResult();

        if (this.currentToken.type !== TokenType.keyword || this.currentToken.value !== "for") {
            return result.failure(new ExpectedError([ "for" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "LPAREN") {
            return result.failure(new ExpectedError([ "(" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.identifier) {
            return result.failure(new ExpectedIdentifierError(this.currentToken.startPosition, this.currentToken.endPosition));
        }

        const name = this.currentToken;

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.keyword || this.currentToken.value !== "in") {
            return result.failure(new ExpectedError([ "in" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const startValue = result.register(this.expression());

        if (result.error) {
            return result;
        }

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "DOTDOT") {
            return result.failure(new ExpectedError([ ".." ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const endValue = result.register(this.expression());

        if (result.error) {
            return result;
        }

        let stepValue: Node | undefined;

        // @ts-ignore
        if (this.currentToken.type === TokenType.operator && this.currentToken.value === "DOTDOT") {
            result.registerAdvancement();
            this.advance();

            stepValue = result.register(this.expression());

            if (result.error) {
                return result;
            }
        }

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
            return result.failure(new ExpectedError([ ")" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        if (this.currentToken.type !== TokenType.arrow) {
            return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const body = result.register(this.expression());

        if (result.error) {
            return result;
        }

        return result.success(new ForNode(name, startValue, endValue, body, stepValue));
    }

    public whileExpression() {
        const result = new ParseResult();

        if (this.currentToken.type !== TokenType.keyword || this.currentToken.value !== "while") {
            return result.failure(new ExpectedError([ "while" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "LPAREN") {
            return result.failure(new ExpectedError([ "(" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const condition = result.register(this.expression());

        if (result.error) {
            return result;
        }

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
            return result.failure(new ExpectedError([ ")" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        if (this.currentToken.type !== TokenType.arrow) {
            return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const body = result.register(this.expression());

        if (result.error) {
            return result;
        }

        return result.success(new WhileNode(condition, body));
    }

    public power(): ParseResult {
        return this.binaryOperation(this.call, [ "POW" ], this.factor);
    }

    public call() {
        const
            result = new ParseResult(),
            atom = result.register(this.atom());

        if (result.error) {
            return result;
        }

        if (this.currentToken.type === TokenType.operator && this.currentToken.value === "LPAREN") {
            result.registerAdvancement();
            this.advance();

            const argumentNodes: Node[] = [];

            // @ts-ignore
            if (this.currentToken.type === TokenType.operator && this.currentToken.value === "RPAREN") {
                result.registerAdvancement();
                this.advance();
            } else {
                argumentNodes.push(result.register(this.expression()));

                if (result.error) {
                    return result.failure(new ExpectedError([ ")", "var", "if", "for", "while", "func", "number", "identifier" ], this.currentToken.startPosition, this.currentToken.endPosition));
                }

                // @ts-ignore
                while (this.currentToken.type === TokenType.comma) {
                    result.registerAdvancement();
                    this.advance();

                    argumentNodes.push(result.register(this.expression()));

                    if (result.error) {
                        return result;
                    }
                }

                // @ts-ignore
                if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
                    return result.failure(new ExpectedError([ ",", ")" ], this.currentToken.startPosition, this.currentToken.endPosition));
                }

                result.registerAdvancement();
                this.advance();
            }

            return result.success(new CallNode(atom, argumentNodes));
        }

        return result.success(atom);
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

    public arithmeticExpression() {
        return this.binaryOperation(this.term, [ "PLUS", "MINUS" ]);
    }

    public compareExpression() {
        const result = new ParseResult();

        if (this.currentToken.type === TokenType.operator && this.currentToken.value === "NOT") {
            const operatorToken = this.currentToken;

            result.registerAdvancement();
            this.advance();

            const node = result.register(this.compareExpression());

            if (result.error) {
                return result;
            }

            return result.success(new UnaryOperationNode(operatorToken, node));
        }

        const node = result.register(this.binaryOperation(this.arithmeticExpression, [ "EE", "NE", "LT", "GT", "LTE", "GTE" ]));

        if (result.error) {
            return result.failure(new ExpectedError([ "number", "identifier", "+", "-", "(", "!" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        return result.success(node);
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

        const node = result.register(this.binaryOperation(this.compareExpression, [ "and", "or" ]));

        if (result.error) {
            return result.failure(new ExpectedError([ "number", "identifier", "var", "const", "if", "for", "while", "func", "+", "-", "(", "!" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        return result.success(node);
    }

    public functionDefinition() {
        const result = new ParseResult();

        if (this.currentToken.type !== TokenType.keyword || this.currentToken.value !== "func") {
            return result.failure(new ExpectedError([ "func" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        let variableNameToken: Token | undefined;

        // @ts-ignore
        if (this.currentToken.type === TokenType.identifier) {
            variableNameToken = this.currentToken;

            result.registerAdvancement();
            this.advance();
        }

        // @ts-ignore
        if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "LPAREN") {
            return result.failure(new ExpectedError([ "(" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const argumentNameTokens: Token[] = [];

        if (this.currentToken.type === TokenType.identifier) {
            argumentNameTokens.push(this.currentToken);

            result.registerAdvancement();
            this.advance();

            while (this.currentToken.type === TokenType.comma) {
                result.registerAdvancement();
                this.advance();

                if (this.currentToken.type !== TokenType.identifier) {
                    return result.failure(new ExpectedIdentifierError(this.currentToken.startPosition, this.currentToken.endPosition));
                }

                argumentNameTokens.push(this.currentToken);

                result.registerAdvancement();
                this.advance();
            }

            if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
                return result.failure(new ExpectedError([ ")", "," ], this.currentToken.startPosition, this.currentToken.endPosition));
            }
        } else {
            if (this.currentToken.type !== TokenType.operator || this.currentToken.value !== "RPAREN") {
                return result.failure(new ExpectedError([ "identifier", ")" ], this.currentToken.startPosition, this.currentToken.endPosition));
            }
        }

        result.registerAdvancement();
        this.advance();

        if (this.currentToken.type !== TokenType.arrow) {
            return result.failure(new ExpectedError([ "->" ], this.currentToken.startPosition, this.currentToken.endPosition));
        }

        result.registerAdvancement();
        this.advance();

        const nodeToReturn = result.register(this.expression());

        if (result.error) {
            return result;
        }

        return result.success(new FunctionDefineNode(variableNameToken, argumentNameTokens, nodeToReturn));
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
