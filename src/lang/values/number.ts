import NaNError from "../../errors/interpreter/values/not-a-number";
import DivideByZeroError from "../../errors/lang/runtime/divide-by-zero";

import Value from "./base";

export default class NumberValue extends Value {
    public addedTo(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new NumberValue(this.value + other.value).setContext(this.context);
    }

    public subbedBy(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new NumberValue(this.value - other.value).setContext(this.context);
    }

    public multipliedBy(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new NumberValue(this.value * other.value).setContext(this.context);
    }

    public dividedBy(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        if (other.value == 0) {
            throw new DivideByZeroError(this.context, this.startPosition, this.endPosition);
        }

        return new NumberValue(this.value / other.value).setContext(this.context);
    }

    public moddedBy(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        if (other.value == 0) {
            throw new DivideByZeroError(this.context, this.startPosition, this.endPosition);
        }

        return new NumberValue(this.value % other.value).setContext(this.context);
    }

    public poweredBy(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new NumberValue(this.value ** other.value).setContext(this.context);
    }
}
