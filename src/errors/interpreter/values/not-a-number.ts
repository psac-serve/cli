export default class NaNError extends Error {
    constructor() {
        super("Not a number.");
    }
}
