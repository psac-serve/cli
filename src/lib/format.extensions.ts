import repeat from "repeat-string";
import wrapAnsi from "wrap-ansi";

export {};

declare global {
    interface Array<T> {
        alignWith<T extends string>(key: string): string[]
    }

    interface String {
        wrapIn(columns: number): string
    }
}

Array.prototype.alignWith = (key: string): string[] => {
    const lines = this as unknown as string[];
    const max   = Math.max(...lines.map(line => line.split(key)[0].length));

    return lines.map(line => line.split(key)[0] + repeat(" ", max - line.split(key)[0].length) + " " + key + " " + line.split(key)[1]);
};

String.prototype.wrapIn = (columns: number): string => wrapAnsi(this as unknown as string, columns);
