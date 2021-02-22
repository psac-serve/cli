import NaNError from "../../errors/lexing/not-a-number";
import InvalidIPv4Error from "../../errors/lexing/invalid-ipv4";
import InvalidOperatorError from "../../errors/lexing/invalid-operator";
import InvalidTokenError from "../../errors/lexing/invalid-token";

import Position from "../position";

import Token, { TokenType } from "../tokens";

export default class Lexer {
    public constructor(public text: string, public filename: string, public position = new Position(-1, 0, -1, filename, text), public madeTokens: Token[] = [], public currentChar?: string, public previousChar?: string) {
        this.advance();
    }

    public advance() {
        this.position.advance(this.currentChar || "");

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

        if (!(+numberString && !Number.isNaN(+numberString))) {
            throw new NaNError(startPosition, this.position);
        }

        return new Token(TokenType.number, `${+numberString}`, startPosition, this.position);
    }

    public makeOperators() {
        const startPosition = this.position.copy().advance();
        const nextChar = this.text[this.position.index + 1] || "";

        const
            operators: { [operator: string]: string } = {
                "%": "MOD",
                "&&": "AND",
                "(": "LPAREN",
                ")": "RPAREN",
                "*": "MUL",
                "**": "POW",
                "+": "PLUS",
                "-": "MINUS",
                "/": "DIV",
                ";": "SEMI",
                "||": "NOT"
            },
            reference = ((this.currentChar || "") + (/[\t &();|]/.test(nextChar) ? nextChar : "")).trim();

        this.advance();

        return reference in operators ? new Token(TokenType.operator, operators[reference], this.position) : (() => {
            throw new InvalidOperatorError(startPosition, this.position);
        })();
    }

    public makeTokens() {
        while (this.currentChar) {
            if (" \t".includes(this.currentChar)) {
                this.advance();
            } else if (/\d/.test(this.currentChar || "") || ("0123456789".includes(this.previousChar || "") && this.currentChar === "e") || (this.currentChar === "." && "0123456789".includes(this.previousChar || ""))) {
                this.madeTokens.push(this.makeNumbers());
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
