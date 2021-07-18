import { Command } from "https://deno.land/x/cliffy@v0.19.3/command/mod.ts";

import { sprintf } from "https://deno.land/std@0.101.0/fmt/printf.ts";
import * as colors from "https://deno.land/std@0.101.0/fmt/colors.ts";

import i18next from "https://deno.land/x/i18next/index.js";
import resourcesToBackend from "https://deno.land/x/i18next_resources_to_backend@v1.0.0/index.js";
import LanguageDetector from "./language-detector.ts";
import { t } from "./translate.ts";

import { validator } from "./logger/mod.ts";

interface Flags {
    hostname: string,

    version: boolean,
    help: boolean,
    verbose: boolean,
    compress: boolean,
    ignoreTest: boolean,
    useToken: boolean
}

export let flags: Flags;

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
        });

    const command = await new Command()
        .name("psac")
        .description(t("description"))
        .arguments("<hostname:string>")
        .option("-c, --compress", t("usage.compress"), { default: true })
        .option("-I, --ignore-test", t("usage.ignore-test"), { default: true })
        .option("-t, --use-token", t("usage.use-token"), { default: true })
        .option("-v, --verbose", t("usage.verbose"), { default: true })
        .option("-V, --version", t("usage.version"), { standalone: true })
        .parse([ ...Deno.args, ...args ]);

    flags = { ...command.options, ...{ hostname: command.args[0] } } as unknown as Flags;

    if (flags.version) {
        console.log(`PSAC Client dev, ${t("description")}
Deno ${Deno.version.deno}
Compiled by TypeScript ${Deno.version.typescript}`);

        return 0;
    }

    if (!Deno.isatty(Deno.stdin.rid)) {
        console.error("Error - " + t("startup.isatty"));

        return -1;
    }

    let hostname;

    try {
        const hostnameFlag = flags.hostname;
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
