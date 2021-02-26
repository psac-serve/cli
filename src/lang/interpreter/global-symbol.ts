import NumberValue from "../values/number";

import SymbolTable from "../symbol-table";

const globalSymbolTable = new SymbolTable();

globalSymbolTable.set("null", new NumberValue(0));

export default globalSymbolTable;
