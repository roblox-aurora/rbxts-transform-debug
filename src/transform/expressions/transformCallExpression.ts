import ts from "typescript";
import { TransformState } from "../../class/transformState";
import { transformNode } from "../transformNode";

export function transformCallExpression(state: TransformState, node: ts.CallExpression): ts.Expression {
	const symbol = state.getSymbol(node.expression);
	if (symbol !== undefined) {
		const callMacro = state.getCallMacro(symbol);
		if (callMacro) {
			return ts.visitEachChild(
				callMacro.transform(state, node, { symbol, symbols: [symbol] }),
				(node) => transformNode(state, node),
				state.context,
			);
		}
	}

	return ts.visitEachChild(node, (node) => transformNode(state, node), state.context);
}
