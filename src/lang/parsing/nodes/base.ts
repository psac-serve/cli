import Token from "../../tokens";

export default abstract class Node {
    protected constructor(public token: Token) {}

    abstract toString(): string
}
