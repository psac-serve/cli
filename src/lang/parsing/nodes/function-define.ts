import Token from "../../tokens";

import Node from "./base";

export default class FunctionDefineNode extends Node {
    public constructor(public variableNameToken: Token | undefined, public argumentNameTokens: Token[], public body: Node) {
        super(body.token);

        if (variableNameToken) {
            this.startPosition = variableNameToken.startPosition;
        } else if (argumentNameTokens.length > 0) {
            this.startPosition = argumentNameTokens[0].startPosition;
        } else {
            this.startPosition = body.endPosition;
        }

        this.endPosition = body.endPosition || this.startPosition;
    }

    public toString(): string {
        return `DEFINE-FUNCTION:${this.variableNameToken ? this.variableNameToken.value || "<anonymous>" : ""}[ ${this.argumentNameTokens.map(argumentName => argumentName.value || "").join(", ").trim()} ] -> ${this.body.toString()}`;
    }
}
