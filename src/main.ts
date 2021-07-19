import { Command } from "https://deno.land/x/cliffy@v0.19.3/command/mod.ts";

import { sprintf } from "https://deno.land/std@0.101.0/fmt/printf.ts";
import * as colors from "https://deno.land/std@0.101.0/fmt/colors.ts";

import i18next from "https://deno.land/x/i18next/index.js";
import resourcesToBackend from "https://deno.land/x/i18next_resources_to_backend@v1.0.0/index.js";
import LanguageDetector from "./language-detector.ts";
import { t } from "./translate.ts";

import { validator } from "./logger/mod.ts";

interface Options {
    hostname?: string,

    verbose: boolean,
    compress: boolean,
    ignoreTest?: boolean,
    useToken: boolean
}

type Arguments = [ string ]

export let flags: Options;

export const main = async (...args: string[]): Promise<number> => {
    await i18next
        .use(resourcesToBackend(async (
            language: string,
            namespace: string,
            callback: (
                error: Error | null,
                resources: Record<string, string> | null
            ) => void
        ) => {
            try {
                const resources = JSON.parse(
                    await Deno.readTextFile(`${
                        new URL(
                            ".",
                            import.meta.url
                        ).pathname
                    }/locales/${language}/${namespace}.json`)
                );

                callback(null, resources);
            } catch (error) {
                callback(error, null);
            }
        }))
        .use(LanguageDetector)
        .init({
            fallbackLng: "en-US"
        }, () => {});

    const command = new Command<Options, Arguments, {}>()
        .throwErrors()
        .name("psac")
        .description(t("description")
            .split("")
            .map((char: string, index: number) => index == 0 ? char.toUpperCase() : char)
            .join(""))
        .arguments("<hostname:string>")
        .option("-c, --compress", t("usage.compress"), { default: true })
        .option("-C, --no-compress", t("usage.no-compress"))
        .option("-I, --ignore-test", t("usage.ignore-test"))
        .option("-t, --use-token", t("usage.use-token"), { default: true })
        .option("--no-use-token", t("usage.no-use-token"))
        .option("-v, --verbose", t("usage.verbose"), { default: true })
        .option("-V, --version", t("usage.version"), {
            standalone: true, action() {
                console.log(`PSAC Client dev, ${t("description")}
Deno ${Deno.version.deno}
Compiled by TypeScript ${Deno.version.typescript}`);

                Deno.exit(0);
            }
        });

    let parsedCommand;

    try {
        parsedCommand = await command.parse([ ...Deno.args, ...args ]);
    } catch (error) {
        validator.error(error.message);

        return 1;
    }

    flags = {
        ...(
            parsedCommand.options as object as Options
        ), ...{ hostname: parsedCommand.args[0] }
    };

    if (!Deno.isatty(Deno.stdin.rid)) {
        console.error("Error - " + t("startup.isatty"));

        return -1;
    }

    let hostname;

    try {
        const hostnameFlag = flags.hostname || "127.0.0.1";
        let protocol = "";

        if (!/https?:\/\//.test(hostnameFlag)) {
            protocol = "http://";
        }

        hostname = Deno.env.get("DEBUG") ? "127.0.0.1" : new URL(protocol + hostnameFlag).hostname;
    } catch {
        validator.error(t("startup.parse-url"));

        return 1;
    }

    if (!flags.useToken) {
        validator.warn(sprintf(t("security"), colors.bold("--use-token")));
    }

    console.log("Not implemented");

    return 0;
};

if (import.meta.main) {
    Deno.exit(await main());
}
