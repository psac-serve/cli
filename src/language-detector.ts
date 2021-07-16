export default class LanguageDetector {
    static type = "languageDetector" as const;

    private services!: any;
    private i18nextOptions!: any;

    public init(services: any, i18nextOptions: any) {
        this.services = services;
        this.i18nextOptions = i18nextOptions;
    }

    public detect() {
        const env = Deno.env.toObject();

        const shellLocale = env.LC_ALL ??
            env.LC_MESSAGES ??
            env.LANG ??
            env.LANGUAGE;

        const formattedLanguage = this.formatShellLocale(shellLocale);

        if (!formattedLanguage) {
            return this.getFallbackLng();
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

    private getFallbackLng() {
        if (Array.isArray(this.i18nextOptions.fallbackLng)) {
            return this.i18nextOptions.fallbackLng[0];
        }

        if (typeof this.i18nextOptions.fallbackLng === "string") {
            return this.i18nextOptions.fallbackLng;
        }

        return (
            typeof this.i18nextOptions.fallbackLng === "object" &&
            this.i18nextOptions.fallbackLng.default &&
            this.i18nextOptions.fallbackLng.default[0]
        );
    }
}
