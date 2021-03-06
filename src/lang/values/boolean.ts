import NaBError from "../../errors/interpreter/values/not-a-boolean";

import Value from "./base";

export default class BooleanValue extends Value {
    public andedBy(other: unknown) {
        if (!(other instanceof BooleanValue)) {
            throw new NaBError();
        }

        return new BooleanValue(this.value && other.value).setContext(this.context);
    }

    public oredBy(other: unknown) {
        if (!(other instanceof BooleanValue)) {
            throw new NaBError();
        }

        return new BooleanValue(this.value || other.value).setContext(this.context);
    }

    public notted() {
        return new BooleanValue(!this.value).setContext(this.context);
    }


    public isTrue() {
        return !!this.value;
    }
}
