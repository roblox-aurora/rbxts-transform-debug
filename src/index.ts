import path from "path";
import ts, { factory } from "typescript";
import fs from "fs";
import transformDbgExpression, { isDebugMacro, transformToInlineDebugPrint, transformToIIFEDebugPrint } from "./dbg";

const enum MacroIdentifier {
	Debug = "$dbg",
}

const sourceText = fs.readFileSync(path.join(__dirname, "..", "index.d.ts"), "utf8");
function isModule(sourceFile: ts.SourceFile) {
	return sourceFile.text === sourceText;
}
const imports = new Set<ts.SourceFile>();
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

	const source = node.getSourceFile();
	if (!imports.has(source)) imports.add(source);
	return true;
}

function visitNodeAndChildren(
	node: ts.SourceFile,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.SourceFile;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.Node | undefined;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.Node | undefined {
	return ts.visitEachChild(
		visitNode(node, program),
		(childNode) => visitNodeAndChildren(childNode, program, context),
		context,
	);
}

function handleDebugCallExpression(node: ts.CallExpression, functionName: string) {
	switch (functionName) {
		case "$dbg": {
			const [expression] = node.arguments;
			if (ts.isExpressionStatement(node.parent)) {
				return transformToInlineDebugPrint(expression);
			}
			return transformToIIFEDebugPrint(expression);
		}
		default:
			throw `function ${functionName} cannot be handled by this version of rbxts-transform-debug`;
	}
}

function visitCallExpression(node: ts.CallExpression, program: ts.Program) {
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

	return handleDebugCallExpression(node, functionName);
}

function visitNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | ts.Node[] | undefined {
	if (isModuleImportExpression(node, program)) {
		return;
	}

	if (ts.isCallExpression(node)) {
		return visitCallExpression(node, program);
	}

	return node;
}

interface TransformerConfiguration {}
export default function transform(program: ts.Program, configuration: TransformerConfiguration) {
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}
