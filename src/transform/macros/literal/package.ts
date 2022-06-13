import assert from "assert";
import { PackageJson } from "types-package-json";
import ts, { factory } from "typescript";
import { PackageJsonProvider } from "../../../class/packageJsonProvider";
import { TransformState } from "../../../class/transformState";
import { formatTransformerDiagnostic } from "../../../util/shared";
import { toExpression } from "../../../util/toAst";
import { PropertyMacro } from "../macro";

function getRelativePath(
	state: TransformState,
	packageJson: PackageJsonProvider,
	expression: ts.LeftHandSideExpression,
) {
	const packageSymbol = state.symbolProvider.moduleFile?.get("$package");

	if (ts.isIdentifier(expression)) {
		const symbol = state.getSymbol(expression);
		if (symbol === packageSymbol) {
			return packageJson.packageJson;
		}
	}
}

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

export const PackagePropertyMacro: PropertyMacro = {
	getSymbol(state: TransformState) {
		const mod = state.symbolProvider.moduleFile?.get("$package");
		assert(mod, "no $package symbol found");
		return mod;
	},
	transform(state: TransformState, node: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
		const packageSymbol = state.symbolProvider.moduleFile?.get("$package");
		assert(packageSymbol);
		const packageJson = state.packageJsonProvider;

		console.log(ts.SyntaxKind[node.parent.kind], node.parent.getText());

		const name = resolveName(node);

		if (ts.isPropertyAccessExpression(node.parent)) {
		} else {
			const value = packageJson.queryField(name.text as keyof PackageJson);
			if (typeof value === "object") {
				const id = factory.createUniqueName(name.text);
				const expression = toExpression(value, name.text);
				if (expression) {
					state.prereqDeclaration(id, expression);
					return id;
				}
			} else {
				const expression = toExpression(value, name.text);
				if (expression) {
					return expression;
				}
			}
		}

		return node;
	},
};
