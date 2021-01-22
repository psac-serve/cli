import chalk from "chalk";
import cliTruncate from "cli-truncate";
import repeat from "repeat-string";
import stringWidth from "string-width";
import wrapAnsi from "wrap-ansi";

export default class CliComponents {
    public static heading(text: string, wrapIn?: number): string {
        if (wrapIn) {
            text = wrapAnsi(text, wrapIn);
        }

        return chalk`{whiteBright ${text.split("\n").map(line => `  ${line.trim()}  `).join("\n")}}\n` +
               chalk`{dim ${repeat("\u203E", Math.max(...(text.split("\n").map(line => stringWidth(line.trim())))) + 4)}}`;
    }

    public static keyValueContent(contents: { [key: string]: string }[], { truncate = false }: { truncate?: boolean }) {
        const max = Math.max(...contents.map(content => stringWidth(Object.keys(content)[0])));

        return contents.map((content) => {
            const
                titleText = chalk`{blueBright ${Object.keys(content)[0].trim()}}${repeat(" ", max - stringWidth(Object.keys(content)[0].trim()))} `,
                merged    = titleText + Object.values(content)[0].split("\n").map((line, index) => (index === 0 ? line.trim() : repeat(" ", stringWidth(titleText)) + line.trim())).join("\n");

            return truncate ? cliTruncate(merged, process.stdout.columns, { space: true }) : merged;
        }).join("\n");
    }
}
