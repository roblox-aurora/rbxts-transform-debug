import ts, { factory } from "typescript";
import { TransformState } from "../../../class/transformState";
import { transformToInlineDebugPrint, transformToIIFEDebugPrint } from "../../../dbg";
import { CallMacro, MacroInfo } from "../macro";

export const DebugMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile?.get("$dbg");
	},
	transform(state: TransformState, node: ts.CallExpression, { symbol }: MacroInfo) {
		const { enabled } = state.config;

		const [expression, customHandler] = node.arguments;
		if (ts.isExpressionStatement(node.parent) && customHandler === undefined) {
			return enabled
				? transformToInlineDebugPrint(expression)
				: ts.isCallExpression(expression)
				? expression
				: factory.createVoidExpression(factory.createIdentifier("undefined"));
		}
		return enabled ? transformToIIFEDebugPrint(expression, customHandler, state.program) : expression;
	},
};
