import ts, { factory } from "typescript";
import { createDebugPrefixLiteral } from "./shared";

export function transformPrint(node: ts.CallExpression): ts.CallExpression {
	return factory.updateCallExpression(node, factory.createIdentifier("print"), undefined, [
		createDebugPrefixLiteral(node),
		...node.arguments,
	]);
}

export function transformWarning(node: ts.CallExpression): ts.CallExpression {
	return factory.updateCallExpression(node, factory.createIdentifier("warn"), undefined, [
		createDebugPrefixLiteral(node),
		...node.arguments,
	]);
}
