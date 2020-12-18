import path from "path";
import ts, { factory } from "typescript";

function createPrintCallExpression(args: ts.Expression[]) {
	return factory.createCallExpression(factory.createIdentifier("print"), undefined, args);
}

function createDbgPrefix(node: ts.Node) {
	const sourceFile = node.getSourceFile();
	const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const relativePath = path.relative(process.cwd(), node.getSourceFile().fileName).replace(/\\/g, "/");
	return factory.createStringLiteral(`[${relativePath}:${linePos.line + 1}] ${node.getText()} =`, true);
}

export function transformToInlineDebugPrint(node: ts.Expression): ts.Expression {
	return createPrintCallExpression([createDbgPrefix(node), node]);
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
						factory.createExpressionStatement(createPrintCallExpression([createDbgPrefix(argument), id])),
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
