import assert from "assert";
import path from "path";
import ts, { factory } from "typescript";
import { TransformState } from "../../../class/transformState";
import { formatTransformerDiagnostic } from "../../../util/shared";
import { PropertyMacro } from "../macro";

function resolveName(value: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
	if (ts.isPropertyAccessExpression(value)) {
		return value.name;
	} else {
		if (ts.isIdentifier(value.argumentExpression)) {
			return value.argumentExpression;
		} else {
			throw formatTransformerDiagnostic(
				"Invalid macro access",
				value,
				"Try using a literal to access this property.",
			);
		}
	}
}

export const FilePropertyMacro: PropertyMacro = {
	getSymbol(state: TransformState) {
		const mod = state.symbolProvider.moduleFile?.get("$file");
		assert(mod, "no $package symbol found");
		return mod;
	},
	transform(state: TransformState, node: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
		const sourceFile = node.getSourceFile();

		const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
		const relativePath = path
			.relative(state.program.getCurrentDirectory(), sourceFile.fileName)
			.replace(/\\/g, "/");

		const name = resolveName(node);

		switch (name.text) {
			case "filePath":
				return factory.createStringLiteral(relativePath);
			case "lineNumber":
				return factory.createNumericLiteral(linePos.line + 1);
			default:
				throw formatTransformerDiagnostic(`Unknown file property: ${name.text}`, node);
		}
	},
};
