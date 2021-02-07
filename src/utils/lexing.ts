export const regexes = {
    command: "(?<=^|;|\\|)[A-Za-z]+(?= ?)",
    comment: "(#|\\/\\/).*$",
    digits: "(\\d+#\\d+|\\d+#(?! )|\\d+)(([Ee])[+-]?)?(\\d+#\\d+|\\d+#(?! )|\\d+)",
    operators: "([&|]|\\|\\|)",
    semicolon: ";"
};

export const build = (): RegExp => new RegExp(Object.values(regexes).join("|"), "g");
