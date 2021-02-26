import Node from "../parsing/nodes/base";
import NumberNode from "../parsing/nodes/number";
import BinaryOperationNode from "../parsing/nodes/binary-operation";
import UnaryOperationNode from "../parsing/nodes/unary-operation";
import VariableAccessNode from "../parsing/nodes/variable-access";
import VariableAssignNode from "../parsing/nodes/variable-assign";

import NoVisitMethodError from "../../errors/interpreter/no-visit-method";

import NodeViolationError from "../../errors/lang/parsing/node-violation";
import { default as IdentifierNotFoundError } from "../../errors/lang/runtime/reference";

import NumberValue from "../values/number";

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
            if (error instanceof ReferenceError) {
                return this.noVisitMethod(node);
            }

            throw error;
        }
    }

    public noVisitMethod(node: Node) {
        throw new NoVisitMethodError(node.constructor.name);
    }

    public visit_NumberNode(node: NumberNode, context: Context) {
        return new RuntimeResult().success(new NumberValue(+(node.token.value || "0")).setPosition(node.startPosition, node.endPosition).setContext(context));
    }

    public visit_VariableAccessNode(node: VariableAccessNode, context: Context) {
        const result = new RuntimeResult();

        if (!context.symbolTable || !node.name.value) {
            return result.failure(new IdentifierNotFoundError(node.name.value || "", context, node.startPosition, node.endPosition));
        }

        const
            name = node.name.value,
            value = context.symbolTable.get(name);

        if (!value) {
            return result.failure(new IdentifierNotFoundError(node.name.value, context, node.startPosition, node.endPosition));
        }

        return result.success(value);
    }

    public visit_VariableAssignNode(node: VariableAssignNode, context: Context) {
        const result = new RuntimeResult();

        if (!node.name.value || !context.symbolTable) {
            throw new NodeViolationError();
        }

        const
            name = node.name.value,
            value = result.register(this.visit(node.valueNode, context));

        if (result.error) {
            return result;
        }

        context.symbolTable.set(name, value);

        return result.success(value);
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
