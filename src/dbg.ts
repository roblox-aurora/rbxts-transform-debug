import path from "path";
import ts, { factory } from "typescript";
import { createExpressionDebugPrefixLiteral, getDebugInfo } from "./shared";

function createPrintCallExpression(args: ts.Expression[]) {
	return factory.createCallExpression(factory.createIdentifier("print"), undefined, args);
}

export function transformToInlineDebugPrint(node: ts.Expression): ts.Expression {
	return createPrintCallExpression([createExpressionDebugPrefixLiteral(node), node]);
}

export function createIIFEBlock(id: ts.Identifier, argument: ts.Expression): ts.Block {
	return factory.createBlock(
		[
			factory.createExpressionStatement(
				createPrintCallExpression([createExpressionDebugPrefixLiteral(argument), id]),
			),
			factory.createReturnStatement(id),
		],
		true,
	);
}

export function createDebugObject(expression: ts.Expression): ts.ObjectLiteralExpression {
	const info = getDebugInfo(expression);
	return factory.createObjectLiteralExpression(
		[
			factory.createPropertyAssignment("file", factory.createStringLiteral(info.relativePath)),
			factory.createPropertyAssignment("lineNumber", factory.createNumericLiteral(info.linePos)),
			factory.createPropertyAssignment("rawText", factory.createStringLiteral(expression.getText())),
		],
		true,
	);
}

export function createCustomIIFEBlock(
	expression: ts.Expression,
	body: ts.ConciseBody,
	valueParam: ts.ParameterDeclaration,
	debugInfoParam: ts.ParameterDeclaration | undefined,
): ts.Block {
	const newBody = ts.isBlock(body)
		? [...body.statements]
		: [
				factory.createExpressionStatement(
					createPrintCallExpression([createExpressionDebugPrefixLiteral(expression), expression]),
				),
				// factory.createReturnStatement(body),
		  ];
	if (newBody) {
		if (debugInfoParam !== undefined) {
			newBody.unshift(
				factory.createVariableStatement(
					undefined,
					factory.createVariableDeclarationList(
						[
							factory.createVariableDeclaration(
								factory.createIdentifier(debugInfoParam.name.getText()),
								undefined,
								undefined,
								createDebugObject(expression),
							),
						],

						ts.NodeFlags.Const,
					),
				),
			);
		}
	}
	
	return factory.createBlock(newBody);

	// const id = factory.createIdentifier("value");
	// return createIIFEBlock(id, expression);
}

export function transformToIIFEDebugPrint(
	expression: ts.Expression,
	customHandler: ts.Expression,
	program: ts.Program,
): ts.Expression {
	const id = factory.createIdentifier("value");

	if (customHandler) {
		if (ts.isArrowFunction(customHandler) || ts.isFunctionExpression(customHandler)) {
			const {
				body,
				parameters: [source, debugInfo],
			} = customHandler;

			return factory.createCallExpression(
				factory.createParenthesizedExpression(
					factory.createArrowFunction(
						undefined,
						undefined,
						[factory.createParameterDeclaration(undefined, undefined, undefined, id)],
						undefined,
						undefined,
						createCustomIIFEBlock(expression, body, source, debugInfo),
					),
				),
				undefined,
				[expression],
			);
		} else if (ts.isIdentifier(customHandler) || ts.isPropertyAccessExpression(customHandler)) {
			const tmp = factory.createUniqueName("debugInfo");
			return factory.createCallExpression(
				factory.createParenthesizedExpression(
					factory.createArrowFunction(
						undefined,
						undefined,
						[factory.createParameterDeclaration(undefined, undefined, undefined, id)],
						undefined,
						undefined,
						factory.createBlock([
							factory.createVariableStatement(
								undefined,
								factory.createVariableDeclarationList(
									[
										factory.createVariableDeclaration(
											tmp,
											undefined,
											undefined,
											createDebugObject(expression),
										),
									],

									ts.NodeFlags.Const,
								),
							),
							factory.createExpressionStatement(
								factory.createCallExpression(customHandler, undefined, [id, tmp]),
							),
							factory.createReturnStatement(id),
						]),
					),
				),
				undefined,
				[expression],
			);
		} else {
			throw `[rbxts-transform-debug] ${ts.SyntaxKind[customHandler.kind]} not supported in custom $dbg handler`;
		}
	} else {
		return factory.createCallExpression(
			factory.createParenthesizedExpression(
				factory.createArrowFunction(
					undefined,
					undefined,
					[factory.createParameterDeclaration(undefined, undefined, undefined, id)],
					undefined,
					undefined,
					createIIFEBlock(id, expression),
				),
			),
			undefined,
			[expression],
		);
	}
}
