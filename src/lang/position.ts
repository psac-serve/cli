/**
 * Lexing position class.
 */
export default class Position {
    /**
     * Constructor.
     *
     * @param index File index.
     * @param line File line number.
     * @param column File columns.
     * @param filename Filename.
     * @param filetext File text.
     */
    public constructor(public index: number, public line: number, public column: number, public filename: string, public filetext: string) {}

    /**
     * Advance position.
     *
     * @param currentChar The current character.
     *
     * @returns This method can chain.
     */
    public advance(currentChar: string = ""): Position {
        this.index++;
        this.column++;

        if (currentChar === "\n") {
            this.line++;
            this.column = 0;
        }

        return this;
    }

    /**
     * Copy position.
     *
     * @returns Copied position.
     */
    public copy(): Position {
        return new Position(this.index, this.line, this.column, this.filename, this.filetext);
    }

    /**
     * Copy position with minus-ed column and index.
     *
     * @returns Copied position.
     */
    public copyMinus(): Position {
        return new Position(
            this.index !== -1
                ? this.index - 1
                : this.index,
            this.line,
            this.column !== -1
                ? this.column - 1
                : this.column,
            this.filename,
            this.filetext
        );
    }

    /**
     * Copy position with plus-ed column and index.
     *
     * @returns Copied position.
     */
    public copyPlus(): Position {
        return new Position(
            this.index + 1,
            this.line,
            this.column + 1,
            this.filename,
            this.filetext
        );
    }
}
