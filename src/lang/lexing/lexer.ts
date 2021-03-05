import NaNError from "../../errors/lang/lexing/not-a-number";
import InvalidIPv4Error from "../../errors/lang/lexing/invalid-ipv4";
import InvalidOperatorError from "../../errors/lang/lexing/invalid-operator";
import InvalidTokenError from "../../errors/lang/lexing/invalid-token";

import Position from "../position";

import Token, { TokenType } from "../tokens";

export const keywords: readonly string[] = [
    "var",
    "const",
    "and",
    "or",
    "if",
    "elif",
    "else",
    "then"
] as const;

export default class Lexer {
    public constructor(public filename: string, public text: string, public position = new Position(-1, 0, -1, filename, text), public madeTokens: Token[] = [], public currentChar?: string, public previousChar?: string) {
        this.advance();
    }

    public advance() {
        this.position.advance(this.currentChar);

        [
            this.previousChar,
            this.currentChar
        ] = [
            this.currentChar,
            this.text[this.position.index]
        ];
    }

    public makeIPv4(firstValue: string, startPosition: Position) {
        if (!firstValue || Number.isNaN(+firstValue) || +firstValue < 0 || +firstValue > 255.255) {
            throw new NaNError(startPosition, this.position);
        }

        let cacheValue = "",
            dotCount = 0,
            valuePosition = this.position.copy();

        const values: [ string, string, string, string ] = [ firstValue.split(".")[0], firstValue.split(".")[1], "", "" ];

        while (this.currentChar && "0123456789.".includes(this.currentChar)) {
            if (/\d/.test(this.currentChar)) {
                if (this.previousChar === "0") {
                    while (this.currentChar === "0") {
                        this.advance();
                    }

                    throw new InvalidIPv4Error(
                        valuePosition,
                        this.position
                    );
                }

                cacheValue += this.currentChar;
            } else if (this.currentChar === ".") {
                valuePosition = this.position.copy().advance().advance();

                if (!cacheValue || Number.isNaN(+cacheValue) || +cacheValue > 255) {
                    throw new InvalidIPv4Error(
                        valuePosition,
                        this.position
                    );
                }

                [ values[++dotCount + 1], cacheValue ] = [ cacheValue, "" ];
            }

            this.advance();
        }

        values[3] = cacheValue;

        if (!dotCount || !values.every(value => value)) {
            throw new InvalidIPv4Error(
                this.position.advance(),
                this.position.copy().advance().advance()
            );
        }

        return new Token(TokenType.ipv4, values.join("."));
    }

    public makeNumbers() {
        let numberString: string = "",
            dotCount: number = 0;

        const startPosition = this.position.copy();

        while (this.currentChar && "0123456789.e".includes(this.currentChar)) {
            if (this.currentChar === "." && !"0123456789".includes(this.previousChar || "")) {
                dotCount++;
                numberString += ".";
            } else if (this.currentChar === "." && "0123456789".includes(this.previousChar || "")) {
                if (dotCount) {
                    this.advance();

                    return this.makeIPv4(numberString, startPosition);
                }

                dotCount++;
                numberString += ".";
            } else if (this.currentChar === "e" && !("123456789".includes(this.previousChar || ""))) {
                throw new NaNError(startPosition, this.position);
            } else {
                numberString += this.currentChar;
            }

            this.advance();
        }

        if (+numberString === 0) {
            return new Token(TokenType.number, "0", startPosition, this.position);
        }

        if (!(+numberString && !Number.isNaN(+numberString))) {
            throw new NaNError(startPosition, this.position);
        }

        return new Token(TokenType.number, `${+numberString}`, startPosition, this.position);
    }

    public makeIdentifier() {
        let identifier = "";

        const startPosition = this.position.copy();

        while (this.currentChar && /[\dA-z]/.test(this.currentChar)) {
            identifier += this.currentChar;

            this.advance();
        }

        const tokenType = keywords.includes(identifier) ? TokenType.keyword : TokenType.identifier;

        return new Token(tokenType, identifier, startPosition, this.position);
    }

    public makeNotEquals() {
        const startPosition = this.position.copy();

        this.advance();

        if (this.currentChar === "=") {
            this.advance();

            return new Token(TokenType.operator, "NE", startPosition, this.position);
        } else if (/[!A-Za-z]/.test(this.currentChar || "")) {
            return new Token(TokenType.operator, "NOT", startPosition, this.position);
        }

        return new Token(TokenType.operator, "NOT", startPosition, this.position);
    }

    public makeEquals() {
        const startPosition = this.position.copy();

        let tokenType = "EQ";

        this.advance();

        if (this.currentChar === "=") {
            this.advance();

            tokenType = "EE";
        }

        return new Token(TokenType.operator, tokenType, startPosition, this.position);
    }

    public makeLessThan() {
        const startPosition = this.position.copy();

        let tokenType = "LT";

        this.advance();

        if (this.currentChar === "=") {
            this.advance();

            tokenType = "LTE";
        }

        return new Token(TokenType.operator, tokenType, startPosition, this.position);
    }

    public makeGreaterThan() {
        const startPosition = this.position.copy();

        let tokenType = "GT";

        this.advance();

        if (this.currentChar === "=") {
            this.advance();

            tokenType = "GTE";
        }

        return new Token(TokenType.operator, tokenType, startPosition, this.position);
    }

    public makeOperators() {
        const startPosition = this.position.copy().advance();
        const nextChar = this.text[this.position.index + 1] || "";

        const
            doubleOperators: { [operator: string]: string } = {
                "&&": "AND",
                "**": "POW",
                "||": "NOT"
            },
            doubleReference = ((this.currentChar || "") + (/[\t &*|]/.test(nextChar) ? nextChar : "")).trim();

        if (doubleReference in doubleOperators) {
            this.advance();
            this.advance();

            return new Token(TokenType.operator, doubleOperators[doubleReference], startPosition, this.position);
        }

        const
            operators: { [operator: string]: string } = {
                "%": "MOD",
                "(": "LPAREN",
                ")": "RPAREN",
                "*": "MUL",
                "+": "PLUS",
                "-": "MINUS",
                "/": "DIV",
                ";": "SEMI",
                "=": "EQ"
            },
            reference = (this.currentChar || "").trim();

        this.advance();

        return reference in operators ? new Token(TokenType.operator, operators[reference], startPosition, this.position) : (() => {
            throw new InvalidOperatorError(startPosition, this.position);
        })();
    }

    public makeTokens() {
        while (this.currentChar) {
            if (" \t".includes(this.currentChar)) {
                this.advance();
            } else if (/\d/.test(this.currentChar || "") || ("0123456789".includes(this.previousChar || "") && this.currentChar === "e") || (this.currentChar === "." && "0123456789".includes(this.previousChar || ""))) {
                this.madeTokens.push(this.makeNumbers());
            } else if (/[A-Za-z]/.test(this.currentChar || "")) {
                this.madeTokens.push(this.makeIdentifier());
            } else if (this.currentChar === "!") {
                this.madeTokens.push(this.makeNotEquals());
            } else if (this.currentChar === "=") {
                this.madeTokens.push(this.makeEquals());
            } else if (this.currentChar === "<") {
                this.madeTokens.push(this.makeLessThan());
            } else if (this.currentChar === ">") {
                this.madeTokens.push(this.makeGreaterThan());
            } else if (/[%&()*+/;^|-]/.test(this.currentChar)) {
                this.madeTokens.push(this.makeOperators());
            } else {
                this.advance();

                throw new InvalidTokenError(this.currentChar, this.position, this.position);
            }
        }

        this.madeTokens.push(new Token(TokenType.eof));

        return this.madeTokens;
    }
}
