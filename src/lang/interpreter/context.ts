import Position from "../position";
import SymbolTable from "../symbol-table";

export default class Context {
    public constructor(public displayName: string, public parent?: Context, public parentEntryPosition?: Position, public symbolTable?: SymbolTable) {}
}
