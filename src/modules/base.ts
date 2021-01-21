import { __ } from "i18n";

/**
 * The abstract base class to implement module operations and necessary informations.
 */
export default abstract class Module {
    /**
     * The boolean value whether this module is runnning / enabled.
     */
    public enabled = false

    /**
     * Constructor.
     *
     * @param name
     * @param _description The module description to use.
     *
     * @returns The instance of this class.
     */
    protected constructor(public name: string, private _description: string) {}

    /**
     * Encapsulated _description value.
     *
     * @returns Translated description.
     */
    get description(): string {
        return __(this._description);
    }

    /**
     * Initialize and enable this module.
     *
     * @returns Promise class to use await or .then().
     */
    abstract init(): Promise<void>

    /**
     * Close and disable this module.
     *
     * @returns Promise class to use await or .then().
     */
    abstract close(): Promise<void>

    /**
     * Call the module body.
     * Each module body is different.
     *
     * @returns The module body to use functions.
     */
    abstract use(): unknown
}

