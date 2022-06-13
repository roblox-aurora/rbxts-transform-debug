import assert from "assert";
import ts, { factory } from "typescript";
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

const symbolCache = new Map<ts.Symbol, ts.Node>();

export const PackagePropertyMacro: PropertyMacro = {
	getSymbol(state: TransformState) {
		const mod = state.symbolProvider.moduleFile?.get("$package");
		assert(mod, "no $package symbol found");
		return mod;
	},
	transform(state: TransformState, node: ts.PropertyAccessExpression | ts.ElementAccessExpression) {
		const packageJson = state.packageJsonProvider;

		const parentPath = getRelativePath(state, packageJson, node.expression);

		if (ts.isPropertyAccessExpression(node)) {
			const rhs = node.name;

			const value: unknown = parentPath?.[rhs.text as never];

			const retExpression = toExpression(value);

			if (typeof value === "object") {
				const id = factory.createUniqueName(rhs.text);
				state.prereq(
					factory.createVariableStatement(
						undefined,
						factory.createVariableDeclarationList(
							[factory.createVariableDeclaration(id, undefined, undefined, retExpression)],
							ts.NodeFlags.Const,
						),
					),
				);

				return id;
			} else {
				if (retExpression !== undefined) {
					return retExpression;
				}
			}
		}

		return node;
	},
};
