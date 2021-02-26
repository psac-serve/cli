import RuntimeError from "../../errors/lang/runtime/base";

import Value from "../values/base";

export default class RuntimeResult {
    public constructor(public value?: any, public error?: RuntimeError) {}

    public register(result: RuntimeResult) {
        if (result.error) {
            this.error = result.error;
        }

        return result.value;
    }

    public success(value: Value) {
        this.value = value;

        return this;
    }

    public failure(error: RuntimeError) {
        throw error;
    }
}
