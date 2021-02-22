import Lexer  from "./lexer";

const runLexer = (text: string, filename: string) => {
    const lexer = new Lexer(text, filename);

    return lexer.makeTokens();
};

export default runLexer;
