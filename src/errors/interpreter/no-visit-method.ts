export default class NoVisitMethodError extends Error {
    constructor(name: string) {
        super(`No visit_${name} method defined.`);
    }
}
