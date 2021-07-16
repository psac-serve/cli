import * as log from "https://deno.land/std@0.101.0/log/mod.ts";

await Deno.mkdir("./logs", {
    recursive: true
});

await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler("DEBUG", {
            formatter: (record) => {
                let msg = "";

                return msg;
            }
        }),

        file: new log.handlers.RotatingFileHandler("WARNING", {
            maxBytes: 2.097152e+7,
            maxBackupCount: 5,
            filename: "./logs/psac-serve.log"
        })
    }
});

export default log;
