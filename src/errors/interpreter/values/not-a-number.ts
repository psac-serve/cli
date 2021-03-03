export default class NaNError extends TypeError {
    constructor() {
        super("Not a number.");
    }
}
