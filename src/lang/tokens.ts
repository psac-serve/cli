import Position from "./position";

/**
 * Lexing tokens.
 */
export enum TokenType {
    /**
     * End of File.
     */
    eof = "EOF",

    /**
     * IPv4 address token.
     */
    ipv4 = "IPV4",

    /**
     * Number token.
     */
    number = "NUMBER",

    /**
     * Operator token.
     */
    operator = "OPERATOR"
}

export default class Token {
    public constructor(public type: TokenType, public value?: string, public startPosition?: Position, public endPosition?: Position) {
        if (startPosition) {
            this.startPosition = startPosition.copy();
            this.endPosition = startPosition.copy().advance();
        }

        if (endPosition) {
            this.endPosition = endPosition.copy();
        }
    }

    public toString(): string {
        return `${this.type}${this.value ? ":" + this.value : ""}`;
    }
}
