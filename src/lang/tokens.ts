/**
 * Lexing tokens.
 */
export enum TokenType {
    /**
     * Arrow operand for functions.
     */
    arrow = "ARROW",

    /**
     * Commas.
     */
    comma = "COMMA",

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
    operator = "OPERATOR",

    /**
     * Language-defined keywords.
     */
    keyword = "KEYWORD",

    /**
     * Identifiers.
     */
    identifier = "IDENTIFIER"
}

export default class Token {
    public constructor(public type: TokenType, public value?: string, public startPosition?: any, public endPosition?: any) {
        if (startPosition) {
            this.startPosition = startPosition.copy();
            this.endPosition = startPosition.copy();
        }

        if (endPosition) {
            this.endPosition = endPosition;
        }
    }

    public toString(): string {
        return `${this.type}${this.value ? ":" + this.value : ""}`;
    }
}
