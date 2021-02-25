import Node from "../parsing/nodes/base";
import NumberNode from "../parsing/nodes/number";
import BinaryOperationNode from "../parsing/nodes/binary-operation";
import UnaryOperationNode from "../parsing/nodes/unary-operation";

import NoVisitMethodError from "../../errors/interpreter/no-visit-method";

import NumberValue from "../values/number";

import LangError from "../../errors/lang/base";

import Context from "./context";

import RuntimeResult from "./result";

export default class Interpreter {
    public constructor() {}

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public visit(node: Node, context: Context) {
        const methodName = `visit_${node.constructor.name}`;

        try {
            return eval(`this.${methodName}(node, context)`);
        } catch (error) {
            if (error instanceof LangError) {
                throw error;
            }

            return this.noVisitMethod(node);
        }
    }

    public noVisitMethod(node: Node) {
        throw new NoVisitMethodError(node.constructor.name);
    }

    public visit_NumberNode(node: NumberNode, context: Context) {
        return new RuntimeResult().success(new NumberValue(+(node.token.value || "0")).setPosition(node.startPosition, node.endPosition).setContext(context));
    }

    public visit_BinaryOperationNode(node: BinaryOperationNode, context: Context) {
        const
            result = new RuntimeResult(),
            left = result.register(this.visit(node.leftNode, context));

        if (result.error) {
            return result;
        }

        const right = result.register(this.visit(node.rightNode, context));

        if (result.error) {
            return result;
        }

        let resultNumber: NumberValue = new NumberValue(0);

        try {
            if (node.operatorToken.value === "PLUS") {
                resultNumber = left.addedTo(right);
            } else if (node.operatorToken.value === "MINUS") {
                resultNumber = left.subbedBy(right);
            } else if (node.operatorToken.value === "MUL") {
                resultNumber = left.multipliedBy(right);
            } else if (node.operatorToken.value === "DIV") {
                resultNumber = left.dividedBy(right);
            } else if (node.operatorToken.value === "MOD") {
                resultNumber = left.moddedBy(right);
            } else if (node.operatorToken.value === "POW") {
                resultNumber = left.poweredBy(right);
            }
        } catch (error) {
            result.failure(error);
        }

        resultNumber.startPosition = node.operatorToken.startPosition;
        resultNumber.endPosition = node.operatorToken.endPosition;

        return result.success(resultNumber);
    }

    public visit_UnaryOperationNode(node: UnaryOperationNode, context: Context) {
        const result = new RuntimeResult();

        let number = result.register(this.visit(node.node, context));

        if (result.error) {
            return result;
        }

        try {
            if (node.operatorToken.value === "MINUS") {
                number = number.multipliedBy(new NumberValue(-1));
            }
        } catch (error) {
            result.failure(error);
        }

        return result.success(number);
    }
}
