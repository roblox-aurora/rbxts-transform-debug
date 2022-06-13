import assert from "assert";
import ts from "typescript";
import { PackageJsonProvider } from "../../../class/packageJsonProvider";
import { TransformState } from "../../../class/transformState";
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

export const PackagePropertyMacro: PropertyMacro = {
	getSymbol(state: TransformState) {
		const mod = state.symbolProvider.moduleFile?.get("$package");
		assert(mod, "no $package symbol found");
		return mod;
	},
	transform(state: TransformState, node: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
		const packageJson = state.packageJsonProvider;

		const parentPath = getRelativePath(state, packageJson, node.expression);
		console.log("parentPath", parentPath);

		if (ts.isPropertyAccessExpression(node)) {
			console.log("ispropAccess", node.name.text);
			const rhs = node.name;
			const value = toExpression(parentPath?.[rhs.text as never]);
			if (value !== undefined) {
				return value;
			}
        }

		return node;
	},
};
