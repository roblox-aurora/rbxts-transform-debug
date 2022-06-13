import ts from "typescript";
import { TransformState } from "../../class/transformState";
import { transformNode } from "../transformNode";

export function transformCallExpression(state: TransformState, node: ts.CallExpression): ts.Expression {
	const symbol = state.getSymbol(node.expression);
	if (symbol !== undefined) {
		const callMacro = state.getCallMacro(symbol);
		if (callMacro) {
			return callMacro.transform(state, node, { symbol, symbols: [symbol] });
		}

		if (symbol.valueDeclaration && ts.isNamedDeclaration(symbol.valueDeclaration)) {
			const valueSymbol = state.getSymbol(symbol.valueDeclaration);
			if (valueSymbol) {
				const callMacro = state.getCallMacro(valueSymbol);
				if (callMacro) {
					return callMacro.transform(state, node, { symbol: valueSymbol, symbols: [valueSymbol] });
				}
			}
		}
	}

	return ts.visitEachChild(node, (node) => transformNode(state, node), state.context);
}
