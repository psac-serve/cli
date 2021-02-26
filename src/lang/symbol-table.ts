import Value from "./values/base";

export default class SymbolTable {
    public constructor(public symbols: { [symbol: string]: any } = {}, public parent?: SymbolTable) {}

    public get(name: string): Value {
        const value = this.symbols[name];

        if (!value && this.parent) {
            return this.parent.get(name);
        }

        return value;
    }

    public set(name: string, value: Value) {
        this.symbols[name] = value;
    }

    public remove(name: string) {
        // @ts-ignore
        this.symbols = Object.assign(...Object.entries(this.symbols).filter(([ , value ]) => value !== name).map(([ key, value ]) => ({ [key]: value })));
    }
}
