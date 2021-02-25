export default class NodeViolationError extends TypeError {
    constructor() {
        super("Node violation detected.");
    }
}
