export default class LanguageDetector {
    static type = "languageDetector" as const;

    private services!: {
        languageUtils: {
            isWhiteListed: (language: string) => boolean,
            formatLanguageCode: (language: string) => string
        }
    };

    public init(services: {
        languageUtils: {
            isWhiteListed: (language: string) => boolean,
            formatLanguageCode: (language: string) => string
        }
    }) {
        this.services = services;
    }

    public detect() {
        const env = Deno.env.toObject();

        const shellLocale = env.LC_ALL ??
            env.LC_MESSAGES ??
            env.LANG ??
            env.LANGUAGE;

        const formattedLanguage = this.formatShellLocale(shellLocale);

        if (!formattedLanguage) {
            return "en-US";
        }

        return formattedLanguage;
    }

    public cacheUserLanguage() {
        return;
    }

    private formatShellLocale(rawLC?: string) {
        if (!rawLC) {
            return;
        }

        const LCs = rawLC.split(":");
        const LC = LCs[0].split(".")[0].replace("_", "-");

        if (LC === "C") {
            return;
        }

        return this.services.languageUtils.formatLanguageCode(LC);
    }

    private checkIfWhiteListed(language: string) {
        return this.services.languageUtils.isWhiteListed(language);
    }
}
