import repeat from "repeat-string";
import wrapAnsi from "wrap-ansi";

/**
 * @internal
 */
export {};

/**
 * Declares function prototypes.
 */
declare global {
    /**
     * String alignment for {@link Array<string>} or {@link string[]}.
     */
    interface Array<T extends string> {
        /**
         * Align string array with the key string.
         *
         * @param key The key string.
         */
        alignWith<T extends string>(key: string): string[]
    }

    /**
     * Command-line string management.
     */
    interface String {
        wrapIn(columns: number): string
    }
}

Array.prototype.alignWith = (key: string): string[] => {
    const lines = this as unknown as string[];

    return lines.map(line => line.split(key)[0] + repeat(" ", Math.max(...lines.map(line => line.split(key)[0].length)) - line.split(key)[0].length) + " " + key + " " + line.split(key)[1]);
};

String.prototype.wrapIn = (columns: number): string => wrapAnsi(this as unknown as string, columns);
