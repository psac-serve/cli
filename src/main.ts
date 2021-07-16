import { parse } from "https://deno.land/std@0.101.0/flags/mod.ts";

import { sprintf } from "https://deno.land/std@0.101.0/fmt/printf.ts";
import * as colors from "https://deno.land/std@0.101.0/fmt/colors.ts";

import i18next from "https://deno.land/x/i18next/index.js";
import resourcesToBackend from "https://deno.land/x/i18next_resources_to_backend@v1.0.0/index.js";
import LanguageDetector from "./language-detector.ts";

import { isURL } from "https://deno.land/x/deno_validator@v0.0.5/mod.ts";

import { validator } from "./logger/mod.ts";

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

const t = i18next.t.bind(i18next);

const flags = parse(Deno.args, {
    string: [
        "_",

        "hostname"
    ],
    boolean: [
        "version",

        "help",
        "verbose",
        "compress",
        "ignore-test",
        "use-token"
    ],
    alias: {
        "version": "V",

        hostname: "_",
        help: "h",
        verbose: "v",
        compress: "c",
        ["ignore-test"]: "i",
        ["use-token"]: "t"
    },
    default: {
        compress: true,
        ["use-token"]: true
    }
});

if (flags.version) {
    console.log(`PSAC Client dev, ${t("description")}
Deno ${Deno.version.deno}
Compiled by TypeScript ${Deno.version.typescript}`);

    Deno.exit();
} else if (flags.help) {
    console.log(
        `${t("usage.usage")}: psac [${t("usage.options").toLowerCase()}] <${t("usage.hostname")}>

${t("usage.options")}:
    -c, --compress     ${t("usage.compress")}
        --no-compress  ${t("usage.no-compress")}
    -i, --ignore-test  ${t("usage.ignore-test")}
    -t, --use-token    ${t("usage.use-token")}
        --no-use-token ${t("usage.no-use-token")}
    -h, --help         ${t("usage.help")}
    -v, --verbose      ${t("usage.verbose")}
    -V, --version      ${t("usage.version")}

${t("usage.project")}`
    );

    Deno.exit();
}

if ([ 0, 1 ].some(fd => !Deno.isatty(fd))) {
    console.error("Error - " + t("startup.isatty"));

    Deno.exit(1);
}

if (flags._.length <= 0) {
    validator.error(t("startup.hostname"));

    Deno.exit(1);
}

let hostname = flags._[0];

if (typeof hostname === "number") {
    validator.error(t("startup.parse-url"));

    Deno.exit(1);
}

if (!isURL(hostname, { protocols: [ "https", "http" ], require_tld: true })) {
    validator.error(t("startup.parse-url"));

    Deno.exit(1);
}

if (!flags["use-token"]) {
    validator.warn(sprintf(t("security"), colors.bold("--use-token")));
}
