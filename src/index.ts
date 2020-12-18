/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import path from "path";
import ts, { factory } from "typescript";
import fs from "fs";
import { transformToInlineDebugPrint, transformToIIFEDebugPrint } from "./dbg";

const sourceText = fs.readFileSync(path.join(__dirname, "..", "index.d.ts"), "utf8");
function isModule(sourceFile: ts.SourceFile) {
	return sourceFile.text === sourceText;
}

function isModuleImportExpression(node: ts.Node, program: ts.Program) {
	if (!ts.isImportDeclaration(node)) {
		return false;
	}

	if (!node.importClause) {
		return false;
	}

	const namedBindings = node.importClause.namedBindings;
	if (!node.importClause.name && !namedBindings) {
		return false;
	}

	const importSymbol = program.getTypeChecker().getSymbolAtLocation(node.moduleSpecifier);

	if (!importSymbol || !isModule(importSymbol.valueDeclaration.getSourceFile())) {
		return false;
	}

	return true;
}

function visitNodeAndChildren(
	node: ts.SourceFile,
	program: ts.Program,
	context: ts.TransformationContext,
	config: DebugTransformConfiguration,
): ts.SourceFile;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
	config: DebugTransformConfiguration,
): ts.Node | undefined;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
	config: DebugTransformConfiguration,
): ts.Node | undefined {
	return ts.visitEachChild(
		visitNode(node, program, config),
		(childNode) => visitNodeAndChildren(childNode, program, context, config),
		context,
	);
}

function handleDebugCallExpression(
	node: ts.CallExpression,
	functionName: string,
	{ enabled }: DebugTransformConfiguration,
) {
	switch (functionName) {
		case "$dbg": {
			const [expression] = node.arguments;
			if (ts.isExpressionStatement(node.parent)) {
				return enabled
					? transformToInlineDebugPrint(expression)
					: ts.isCallExpression(expression)
					? expression
					: factory.createEmptyStatement();
			}
			return enabled ? transformToIIFEDebugPrint(expression) : expression;
		}
		default:
			throw `function ${functionName} cannot be handled by this version of rbxts-transform-debug`;
	}
}

function visitCallExpression(node: ts.CallExpression, program: ts.Program, config: DebugTransformConfiguration) {
	const typeChecker = program.getTypeChecker();
	const signature = typeChecker.getResolvedSignature(node);
	if (!signature) {
		return node;
	}
	const { declaration } = signature;
	if (!declaration || ts.isJSDocSignature(declaration) || !isModule(declaration.getSourceFile())) {
		return node;
	}

	const functionName = declaration.name && declaration.name.getText();
	if (!functionName) {
		return node;
	}

	return handleDebugCallExpression(node, functionName, config);
}

function visitNode(node: ts.SourceFile, program: ts.Program, config: DebugTransformConfiguration): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program, config: DebugTransformConfiguration): ts.Node | undefined;
function visitNode(
	node: ts.Node,
	program: ts.Program,
	config: DebugTransformConfiguration,
): ts.Node | ts.Node[] | undefined {
	if (isModuleImportExpression(node, program)) {
		return factory.createExportDeclaration(
			undefined,
			undefined,
			false,
			ts.factory.createNamedExports([]),
			undefined,
		);
	}

	if (ts.isCallExpression(node)) {
		return visitCallExpression(node, program, config);
	}

	return node;
}

export interface DebugTransformConfiguration {
	enabled: boolean;
	verbose?: boolean;
	environmentRequires?: Record<string, string | boolean>;
}

const DEFAULTS: DebugTransformConfiguration = {
	enabled: true,
};

export default function transform(program: ts.Program, userConfiguration: DebugTransformConfiguration) {
	userConfiguration = { ...DEFAULTS, ...userConfiguration };
	if (userConfiguration.environmentRequires) {
		for (const [k, v] of Object.entries(userConfiguration.environmentRequires)) {
			if (
				(typeof v === "boolean" && process.env[k] === undefined) ||
				(typeof v === "string" && process.env[k] !== v)
			) {
				userConfiguration.enabled = false;
			}
		}
	}

	return (context: ts.TransformationContext) => (file: ts.SourceFile) =>
		visitNodeAndChildren(file, program, context, userConfiguration);
}
