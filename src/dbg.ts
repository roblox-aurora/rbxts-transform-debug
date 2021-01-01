import path from "path";
import ts, { factory } from "typescript";
import { createExpressionDebugPrefixLiteral } from "./shared";

function createPrintCallExpression(args: ts.Expression[]) {
	return factory.createCallExpression(factory.createIdentifier("print"), undefined, args);
}

export function transformToInlineDebugPrint(node: ts.Expression): ts.Expression {
	return createPrintCallExpression([createExpressionDebugPrefixLiteral(node), node]);
}

export function transformToIIFEDebugPrint(argument: ts.Expression): ts.Expression {
	const id = factory.createIdentifier("value");
	return factory.createCallExpression(
		factory.createParenthesizedExpression(
			factory.createArrowFunction(
				undefined,
				undefined,
				[factory.createParameterDeclaration(undefined, undefined, undefined, id)],
				undefined,
				undefined,
				factory.createBlock(
					[
						factory.createExpressionStatement(createPrintCallExpression([createExpressionDebugPrefixLiteral(argument), id])),
						factory.createReturnStatement(id),
					],
					true,
				),
			),
		),
		undefined,
		[argument],
	);
}
