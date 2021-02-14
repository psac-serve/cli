/**
 * Static dquote checker.
 * This is using from Prompt module.
 */
export default class Quotes {
    /**
     * Check quotes in {@link text}.
     *
     * @param text Text to checker runs.
     *
     * @returns Correct quotes closing.
     */
    public static check(text: string): boolean {
        return (text.replace(/\\"/, "").match(/"/g) || []).length % 2 != 0 ||
            (text.replace(/\\'/, "").match(/'/g) || []).length % 2 != 0 ||
            (text.replace(/\\`/, "").match(/`/g) || []).length % 2 != 0;
    }
}
