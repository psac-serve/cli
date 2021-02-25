import Position from "../position";

export default class Context {
    public constructor(public displayName: string, public parent?: Context, public parentEntryPosition?: Position) {}
}
