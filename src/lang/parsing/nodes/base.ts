import Token from "../../tokens";
import Position from "../../position";

export default abstract class Node {
    startPosition?: Position
    endPosition?: Position

    protected constructor(public token: Token) {}

    abstract toString(): string
}
