import Context from "../interpreter/context";

export default class Value {
    public startPosition?: any
    public endPosition?: any
    public context: Context = new Context("");

    public constructor(public value?: any) {
        this.setPosition();
    }

    public setPosition(startPosition?: any, endPosition?: any) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;

        return this;
    }

    public setContext(context: Context) {
        this.context = context;

        return this;
    }

    public copy() {
        return this.constructor(this.value)
            .setPosition(this.startPosition, this.endPosition)
            .setContext(this.context);
    }

    public isTrue() {
        return !!this.value;
    }

    public toString() {
        return this.value;
    }
}
