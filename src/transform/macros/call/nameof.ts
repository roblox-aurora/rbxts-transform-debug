import ts, { factory } from "typescript";
import { TransformState } from "../../../class/transformState";
import { formatTransformerDiagnostic } from "../../../util/shared";
import { CallMacro } from "../macro";

export const NameOfMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile!.get("$nameof");
	},
	transform(state: TransformState, expression: ts.CallExpression) {
		const [argument] = expression.arguments;
		const { typeArguments } = expression;

		if (typeArguments !== undefined) {
			const type = typeArguments[0];
			if (ts.isTypeQueryNode(type)) {
				throw formatTransformerDiagnostic(
					`Type queries are not supported by nameof<T>() (where T: ${type.getText()})`,
					type,
					`Use $nameof(${type.exprName.getText()}) instead.`,
				);
			} else {
				if (ts.isTypeReferenceNode(type)) {
					return factory.createStringLiteral(type.getText());
				} else {
					throw formatTransformerDiagnostic(
						"Not supported by $nameof<T>(): " + ts.SyntaxKind[type.kind] + ` (where T : ${type.getText()})`,
						type,
					);
				}
			}
		} else {
			if (ts.isIdentifier(argument)) {
				return factory.createStringLiteral(argument.text);
			} else if (ts.isStringLiteral(argument)) {
				return argument;
			}
		}

		return expression;
	},
};
