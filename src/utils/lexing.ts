/**
 * The regexes to use low-level parsing.
 */
export const regexes = {
    arguments: "--?[A-Za-z-]+(?= ?)",
    command: "(?<=^|;|\\|)[A-Za-z]+(?= ?)",
    comment: "(#|\\/\\/).*$",
    digits: "(\\d+#\\d+|\\d+#(?! )|\\d+)(([Ee])[+-]?)?(\\d+#\\d+|\\d+#(?! )|\\d+)",
    operators: "([&|]|\\|\\|)",
    semicolon: ";"
};

/**
 * Build lexers to one {@link RegExp}.
 *
 * @returns Built {@link RegExp}.
 */
export const build = (): RegExp => new RegExp(Object.values(regexes).join("|"), "g");
