import Lexer  from "./lexer";

const runLexer = (text: string, filename: string) => {
    const lexer = new Lexer(filename, text);

    return lexer.makeTokens();
};

export default runLexer;
