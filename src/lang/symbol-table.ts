import Value from "./values/base";
import BooleanValue from "./values/boolean";

export default class SymbolTable {
    public constantSymbols: { [symbol: string]: any } = {
        false: new BooleanValue(false),
        true: new BooleanValue(true)
    }

    public symbols: { [symbol: string]: any } = {}

    public constructor(public parent?: SymbolTable) {}

    public get(name: string): { isConst: boolean, value: Value } {
        // eslint-disable-next-line unicorn/no-null
        const value = name in this.symbols ? this.symbols[name] : (name in this.constantSymbols ? this.constantSymbols[name] : null);

        if (!value && this.parent) {
            return this.parent.get(name);
        }

        return {
            isConst: name in this.constantSymbols,
            value
        };
    }

    public set(name: string, value: Value, isConst: boolean) {
        if (isConst) {
            this.constantSymbols[name] = value;
        } else {
            this.symbols[name] = value;
        }
    }

    public remove(name: string) {
        // @ts-ignore
        this.symbols = Object.assign(...Object.entries(this.symbols).filter(([ , value ]) => value !== name).map(([ key, value ]) => ({ [key]: value })));
    }
}
