import assert from "assert";
import ts, { factory } from "typescript";
import { TransformState } from "../../../class/transformState";
import { createExpressionDebugPrefixLiteral, formatTransformerDiagnostic, getDebugInfo } from "../../../util/shared";
import { CallMacro, MacroInfo } from "../macro";

function createPrintCallExpression(callExpression: ts.CallExpression | undefined, args: ts.Expression[]) {
	if (callExpression) {
		return factory.updateCallExpression(callExpression, factory.createIdentifier("print"), undefined, args);
	} else {
		return factory.createCallExpression(factory.createIdentifier("print"), undefined, args);
	}
}

export function transformToInlineDebugPrint(callExpression: ts.CallExpression, node: ts.Expression): ts.Expression {
	return createPrintCallExpression(callExpression, [createExpressionDebugPrefixLiteral(node), node]);
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
				createPrintCallExpression(undefined, [createExpressionDebugPrefixLiteral(argument), id]),
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
	state: TransformState,
): ts.Expression {
	if (customHandler) {
		if (ts.isArrowFunction(customHandler) || ts.isFunctionExpression(customHandler)) {
			const {
				body,
				parameters: [sourceParam, debugInfo],
			} = customHandler;

			const valueId =
				sourceParam !== undefined
					? factory.createIdentifier(sourceParam.name.getText())
					: factory.createUniqueName("debug");

			const checker = state.typeChecker;
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
				factory.createArrowFunction(
					undefined,
					undefined,
					[
						factory.createParameterDeclaration(
							undefined,
							undefined,
							undefined,
							valueId,
							undefined,
							undefined,
						),
					],
					undefined,
					undefined,
					createCustomIIFEBlock(expression, body, valueId, debugInfo),
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
		const prereqId = factory.createUniqueName("debug");

		const id = factory.createIdentifier("value");

		state.prereqDeclaration(
			prereqId,
			factory.createArrowFunction(
				undefined,
				undefined,
				[
					factory.createParameterDeclaration(
						undefined,
						undefined,
						undefined,
						id,
						undefined,
						factory.createTypeReferenceNode(
							state.typeChecker.typeToString(state.typeChecker.getTypeAtLocation(expression)),
						),
					),
				],
				undefined,
				undefined,
				createIIFEBlock(id, expression),
			),
		);

		return factory.createCallExpression(prereqId, undefined, [expression]);
	}
}

export const DebugMacro: CallMacro = {
	getSymbol(state: TransformState) {
		const symbol = state.symbolProvider.moduleFile?.get("$dbg");
		assert(symbol, "Could not find debug macro symbol");
		return symbol;
	},
	transform(state: TransformState, node: ts.CallExpression, { symbol }: MacroInfo) {
		const { enabled } = state.config;

		const [expression, customHandler] = node.arguments;
		if (ts.isExpressionStatement(node.parent) && customHandler === undefined) {
			return enabled
				? transformToInlineDebugPrint(node, expression)
				: ts.isCallExpression(expression)
				? expression
				: factory.createVoidExpression(factory.createIdentifier("undefined"));
		}
		return enabled ? transformToIIFEDebugPrint(expression, customHandler, state) : expression;
	},
};
