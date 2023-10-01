import ts, { addRange, factory, PropertyAccessExpression } from "typescript";
import { TransformState } from "../../../class/transformState";
import { formatTransformerDiagnostic } from "../../../util/shared";
import { CallMacro } from "../macro";

export const KeysOfMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile!.get("$keysof");
	},
	transform(state: TransformState, expression: ts.CallExpression) {
		const [argument] = expression.arguments;
		const { typeArguments } = expression;

		if (argument !== undefined) {
			const symbol = state.typeChecker.getSymbolAtLocation(argument);
			if (symbol !== undefined && symbol.declarations) {
				console.log(symbol.declarations[0].getText());
			}
		} else if (typeArguments) {
			const [typeArgument] = typeArguments;
            const typeSymbol = state.typeChecker.getSymbolAtLocation(typeArgument);
            console.log(typeArgument.kind)

            if (typeSymbol !== undefined && typeSymbol.valueDeclaration) {
				console.log(typeSymbol.valueDeclaration.getText());
			}
		}

		return factory.createVoidExpression(factory.createNumericLiteral(0));
	},
};
