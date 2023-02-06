import ts from "typescript";
import { TransformState } from "../class/transformState";
import { transformStatement } from "./transformStatement";
export function getNodeList<T extends ts.Node>(statements: T | T[]): T[] {
	return Array.isArray(statements) ? statements : [statements];
}

export function transformStatementList(state: TransformState, statements: ReadonlyArray<ts.Statement>): ts.Statement[] {
	const result = new Array<ts.Statement>();

	for (const statement of statements) {
		const [newStatements, prereqs] = state.capture(() => transformStatement(state, statement));

		result.push(...prereqs.map((prereq) => transformStatement(state, prereq)));
		result.push(...getNodeList(newStatements));
	}

	return result;
}
