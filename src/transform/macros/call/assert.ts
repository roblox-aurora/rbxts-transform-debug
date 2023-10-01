import ts, { Expression, factory, TemplateSpan } from "typescript";
import { TransformState } from "../../../class/transformState";
import { createDebugPrefixLiteral, createErrorPrefixLiteral } from "../../../util/shared";
import { CallMacro } from "../macro";

function templated(templatesArray: TemplateStringsArray, ...values: Expression[]) {
	if (templatesArray.length === 1 && values.length === 0) {
		return factory.createStringLiteral(templatesArray[0]);
	} else if (values.length === 0) {
		return factory.createNoSubstitutionTemplateLiteral(templatesArray[0]);
	} else {
		const spans = new Array<TemplateSpan>();

		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			const prefix = templatesArray[i + 1];

			// If last, tail
			if (i === values.length - 1) {
				spans.push(factory.createTemplateSpan(value, factory.createTemplateTail(prefix)));
			} else {
				spans.push(factory.createTemplateSpan(value, factory.createTemplateMiddle(prefix)));
			}
		}

		return factory.createTemplateExpression(factory.createTemplateHead(templatesArray[0]), spans);
	}
}

export const AssertMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile!.get("$assert");
	},
	transform(state: TransformState, node: ts.CallExpression) {
		if (node.arguments.length === 2) {
			return factory.updateCallExpression(node, factory.createIdentifier("assert"), undefined, [
				node.arguments[0],
				templated`${createDebugPrefixLiteral(node)} ${factory.createStringLiteral(
					node.arguments[0].getText(),
				)}: ${node.arguments[1]}`,
			]);
		} else {
			return factory.updateCallExpression(node, factory.createIdentifier("assert"), undefined, [
				node.arguments[0],
				templated`${createDebugPrefixLiteral(node)} ${factory.createStringLiteral(
					node.arguments[0].getText(),
				)}: Assertion failed!`,
			]);
		}
	},
};
