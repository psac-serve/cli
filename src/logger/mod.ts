import * as colors from "https://x.nest.land/std@0.101.0/fmt/colors.ts";
import { setup } from "./logger.ts";
import { ConsoleHandler, RotatingFileHandler } from "./handlers.ts";

await Deno.mkdir("./logs", {
    recursive: true
});

export const validator = {
    warn: (msg: string): void => {
        console.warn(`${colors.yellow("Warning")} - ${msg}`);
    },
    error: (msg: string): void => {
        console.error(`${colors.red("Error")} - ${msg}`);
    }
};

await setup({
    handlers: {
        console: new ConsoleHandler("Debug"),

        file: new RotatingFileHandler("Info")
    },
    loggers: {
        default: {
            level: "Debug",
            handlers: [ "console", "file" ]
        },
        dbg: {
            level: "Debug",
            handlers: [ "console" ]
        },
        modules: {
            level: "Debug",
            handlers: [ "console", "file" ]
        }
    }
});
