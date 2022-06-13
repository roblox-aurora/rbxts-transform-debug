import ts from "typescript";
import { TransformState } from "../class/transformState";
import { transformStatement } from "./transformStatement";

export function transformStatementList(state: TransformState, statements: ReadonlyArray<ts.Statement>): ts.Statement[] {
	const result = new Array<ts.Statement>();

	for (const statement of statements) {
		result.push(transformStatement(state, statement));
	}

	return result;
}
