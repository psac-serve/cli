export default class ModuleNotFoundError extends Error {
    constructor() {
        super("Module not found.");
    }
}
