/**
 * Lexing tokens.
 */
const tokens = {
    /**
     * Dividing token.
     */
    div: "DIV",

    /**
     * IPv4 address token.
     */
    ipv4: "IPV4",

    /**
     * Left parenthesis token.
     */
    lparen: "LPAREN",

    /**
     * Minus token.
     */
    minus: "MINUS",

    /**
     * Mod token.
     */
    mod: "MOD",

    /**
     * Multiplying token.
     */
    mul: "MUL",

    /**
     * Number token.
     */
    number: "NUMBER",

    /**
     * Operator token.
     */
    operator: "OPERATOR",

    /**
     * Plus token.
     */
    plus: "PLUS",

    /**
     * Powering token.
     */
    pow: "POW",

    /**
     * Right parenthesis token.
     */
    rparen: "RPAREN"
} as const;

export default tokens;
