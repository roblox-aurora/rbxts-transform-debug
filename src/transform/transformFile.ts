import ts, { factory } from "typescript";
import { TransformState } from "../class/transformState";
import { transformStatementList } from "./transformStatementList";

export function transformFile(state: TransformState, file: ts.SourceFile): ts.SourceFile {
	const statements = transformStatementList(state, file.statements);

	const sourceFile = factory.updateSourceFile(file, statements);

	return sourceFile;
}
