import ts from "typescript";
import { TransformState } from "../class/transformState";
import { transformNode } from "./transformNode";

export function transformStatement(state: TransformState, statement: ts.Statement): ts.Statement {
	return ts.visitEachChild(statement, (newNode) => transformNode(state, newNode), state.context);
}
