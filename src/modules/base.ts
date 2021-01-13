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
* @param _name        The module name.
     * @param _description The module description to use.
     * @param _depends     The module dependencies to use, but only implemented module resolution or calling.
     *
     * @returns The instance of this class.
     */
    constructor(private _name: string, private _description: string) {}

    /**
     * Encapsulated _name value.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Encapsulated _description value.
     */
    get description(): string {
        return this._description;
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

