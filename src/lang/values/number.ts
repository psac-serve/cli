import NaNError from "../../errors/interpreter/values/not-a-number";
import DivideByZeroError from "../../errors/lang/runtime/divide-by-zero";

import Value from "./base";

import BooleanValue from "./boolean";

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

    public getComparisonEQ(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value === other.value).setContext(this.context);
    }

    public getComparisonNE(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value !== other.value).setContext(this.context);
    }

    public getComparisonLT(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value < other.value).setContext(this.context);
    }

    public getComparisonGT(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value > other.value).setContext(this.context);
    }

    public getComparisonLTE(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value <= other.value).setContext(this.context);
    }

    public getComparisonGTE(other: unknown) {
        if (!(other instanceof NumberValue)) {
            throw new NaNError();
        }

        return new BooleanValue(this.value >= other.value).setContext(this.context);
    }

    public copy() {
        return new NumberValue(this.value)
            .setPosition(this.startPosition, this.endPosition)
            .setContext(this.context);
    }

    public isTrue() {
        return this.value != 0;
    }
}
