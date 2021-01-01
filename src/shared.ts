import path from "path";
import ts, { factory } from "typescript";

/**
 * Creates a debug prefix string literal with the expression information of the node
 * `[<filePath>:<lineNumber>] <expressionText> =`
 */
export function createExpressionDebugPrefixLiteral(node: ts.Node): ts.StringLiteral {
	const sourceFile = node.getSourceFile();
	const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const relativePath = path.relative(process.cwd(), node.getSourceFile().fileName).replace(/\\/g, "/");
	return factory.createStringLiteral(`[${relativePath}:${linePos.line + 1}] ${node.getText()} =`, true);
}

/**
 * Creates a debug prefix string literal
 * `[<filePath>:<lineNumber>]`
 */
export function createDebugPrefixLiteral(node: ts.Node): ts.StringLiteral {
	const sourceFile = node.getSourceFile();
	const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const relativePath = path.relative(process.cwd(), node.getSourceFile().fileName).replace(/\\/g, "/");
	return factory.createStringLiteral(`[${relativePath}:${linePos.line + 1}]`, true);
}
