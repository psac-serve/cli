import * as colors from "https://deno.land/std@0.101.0/fmt/colors.ts";

await Deno.mkdir("./logs", {
    recursive: true
});

export const argparse = {
    warn: (msg: string): void => {
        console.warn(`${colors.yellow("Warning")} - ${msg}`);
    },
    error: (msg: string): void => {
        console.error(`${colors.red("Error")} - ${msg}`);
    }
};
