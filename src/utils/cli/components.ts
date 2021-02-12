import chalk from "chalk";
import cliTruncate from "cli-truncate";
import repeat from "repeat-string";
import stringWidth from "string-width";
import wrapAnsi from "wrap-ansi";
import CliTable3 from "cli-table3";

import manager from "../../manager-instance";

export default class CliComponents 
{
    public static heading(text: string, wrapIn?: number, indent = 0): string 
    {
        if (wrapIn) 
        
            text = wrapAnsi(text, wrapIn);
        

        return indent <= 0
            ? chalk`{whiteBright ${text.split("\n").map(line => `  ${line.trim()}  `).join("\n")}}\n` +
              chalk`{dim ${repeat("\u203E", Math.max(...(text.split("\n").map(line => stringWidth(line.trim())))) + 4)}}`
            : chalk`{bold.whiteBright ${text.split("\n").map(line => repeat("  ", indent) + line).join("\n")}`;
    }

    public static content(text: string, indent = 0): string 
    {
        return indent <= 0 ? "" : repeat("  ", indent) + text;
    }

    public static keyValueContent(contents: { [key: string]: string }[], indent = 0, truncate = false): string 
    {
        const max = Math.max(...contents.map(content => stringWidth(Object.keys(content)[0])));

        return contents.map((content) => 
        {
            const
                titleText = chalk`{blueBright ${Object.keys(content)[0].trim()}}${repeat(" ", max - stringWidth(Object.keys(content)[0].trim()))} `,
                merged    = titleText + Object.values(content)[0].split("\n").map((line, index) => (repeat("  ", indent) + (index === 0 ? line.trim() : repeat(" ", stringWidth(titleText)) + line.trim()))).join("\n");

            return truncate ? cliTruncate((indent <= 0 ? "" : repeat("  ", indent)) + merged, manager.columns, { space: true }) : (indent <= 0 ? "" : repeat("  ", indent)) + merged;
        }).join("\n");
    }

    public static blankLine(): string 
    {
        return "\n";
    }

    public static table(options?: CliTable3.TableInstanceOptions): CliTable3.Table 
    {
        return new CliTable3(options || {});
    }

    public static tableString(tableInstance: CliTable3): string 
    {
        return tableInstance.toString();
    }
}
