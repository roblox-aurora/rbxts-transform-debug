import path from "path";
import ts, { factory } from "typescript";
import { createExpressionDebugPrefixLiteral, formatTransformerDiagnostic, getDebugInfo } from "./shared";

function createPrintCallExpression(args: ts.Expression[]) {
	return factory.createCallExpression(factory.createIdentifier("print"), undefined, args);
}

export function transformToInlineDebugPrint(node: ts.Expression): ts.Expression {
	return createPrintCallExpression([createExpressionDebugPrefixLiteral(node), node]);
}

/**
 * Creates a IIFE debug expression
 * @param id The identifier
 * @param argument The expression
 */
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

/**
 * Creates an object with debug information about the specified expression
 * @param expression The expression
 */
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

/**
 * Creates a custom IIFE block based on user input
 * @param expression
 * @param body
 * @param debugInfoParam
 */
export function createCustomIIFEBlock(
	expression: ts.Expression,
	body: ts.ConciseBody,
	sourceId: ts.Identifier,
	debugInfoParam: ts.ParameterDeclaration | undefined,
): ts.Block {
	if (ts.isBlock(body)) {
		const newBody = [...body.statements];

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

		newBody.push(factory.createReturnStatement(sourceId));
		return factory.createBlock(newBody);
	} else {
		const id = factory.createIdentifier("value");
		return createIIFEBlock(id, expression);
	}
}

export function transformToIIFEDebugPrint(
	expression: ts.Expression,
	customHandler: ts.Expression,
	program: ts.Program,
): ts.Expression {
	if (customHandler) {
		if (ts.isArrowFunction(customHandler) || ts.isFunctionExpression(customHandler)) {
			const {
				body,
				parameters: [sourceParam, debugInfo],
			} = customHandler;
			const valueId = factory.createIdentifier(sourceParam.name.getText());

			const checker = program.getTypeChecker();
			const methodSignature = checker.getSignatureFromDeclaration(customHandler);
			if (methodSignature) {
				const returnType = methodSignature.getReturnType();
				const returnSymbol = returnType.getSymbol();
				if (returnSymbol) {
					throw formatTransformerDiagnostic(
						`argument 'customHandler' should return void, got ${returnSymbol.getName()}`,
						customHandler,
					);
				} else {
					// I don't know if there's any other sane way here.
					const typeString = checker.typeToString(returnType);
					if (typeString !== "void") {
						throw formatTransformerDiagnostic(
							`argument 'customHandler' should return void, got ${typeString}`,
							customHandler,
						);
					}
				}
			}

			return factory.createCallExpression(
				factory.createParenthesizedExpression(
					factory.createArrowFunction(
						undefined,
						undefined,
						[factory.createParameterDeclaration(undefined, undefined, undefined, valueId)],
						undefined,
						undefined,
						createCustomIIFEBlock(expression, body, valueId, debugInfo),
					),
				),
				undefined,
				[expression],
			);
		} else if (ts.isIdentifier(customHandler) || ts.isPropertyAccessExpression(customHandler)) {
			const id = factory.createUniqueName("value");
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
			throw formatTransformerDiagnostic(
				`${ts.SyntaxKind[customHandler.kind]} not supported in custom $dbg handler`,
				customHandler,
			);
		}
	} else {
		const id = factory.createUniqueName("value");

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
