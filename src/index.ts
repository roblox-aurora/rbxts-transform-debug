import path from "path";
import ts, { factory } from "typescript";
import fs from "fs";
import transformDbgExpression, { isDebugMacro, transformToDebugPrint, transformToIIFEDebugPrint } from "./dbg";

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

function visitNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | ts.Node[] | undefined {
	if (isModuleImportExpression(node, program)) {
		return;
	}

	if (ts.isExpressionStatement(node)) {
		const { expression } = node;
		if (ts.isCallExpression(expression)) {
			if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
				const { text: functionName } = expression.expression;
				if (functionName === MacroIdentifier.Debug) {
					const expr = transformDbgExpression(expression);

					if (expr) {
						return expr;
					}
				}
			}
		}
	}

	if (ts.isVariableStatement(node)) {
		const containsDbg = node.declarationList.declarations.some((d) => d.initializer && isDebugMacro(d.initializer));
		if (containsDbg) {
			return factory.updateVariableStatement(
				node,
				undefined,
				factory.updateVariableDeclarationList(
					node.declarationList,
					node.declarationList.declarations.map((d) => {
						if (d.initializer && isDebugMacro(d.initializer)) {
							return factory.updateVariableDeclaration(
								d,
								d.name,
								undefined,
								undefined,
								transformToIIFEDebugPrint(d.initializer.arguments[0]),
							);
						}
						return d;
					}),
				),
			);
		}
	}

	if (ts.isReturnStatement(node)) {
		if (node.expression && isDebugMacro(node.expression)) {
			return factory.updateReturnStatement(node, transformToIIFEDebugPrint(node.expression.arguments[0]));
		}
	}

	return node;
}

interface TransformerConfiguration {}
export default function transform(program: ts.Program, configuration: TransformerConfiguration) {
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}
