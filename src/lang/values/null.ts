import Value from "./base";

export default class NullValue extends Value {
    constructor() {
        // eslint-disable-next-line unicorn/no-null
        super(null);
    }
}
