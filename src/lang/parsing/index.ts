import Token from "../tokens";

import Parser from "./parser";

const runParser = (tokens: Token[]) => {
    const
        parser = new Parser(tokens),
        result = parser.parse();

    if (!result.node || result.error) {
        throw result.error;
    }

    return result.node;
};

export default runParser;
