export default class InvalidResponseError extends Error {
    constructor(message: string) {
        super(message);
    }
}
