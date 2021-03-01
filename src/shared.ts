import path from "path";
import ts, { factory } from "typescript";
import chalk from "chalk";

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

export function formatTransformerDiagnostic(message: string, node?: ts.Node): string {
	if (node) {
		const info = getDebugInfo(node);
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.red("macro error")} ${chalk.cyan(
			info.relativePath,
		)}:${chalk.yellow(info.linePos)} - ${message}\n${chalk.italic(node.getText())}`;
	} else {
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.red("macro error")} ` + message;
	}
}

export function getDebugInfo(node: ts.Node) {
	const sourceFile = node.getSourceFile();
	const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const relativePath = path.relative(process.cwd(), node.getSourceFile().fileName).replace(/\\/g, "/");
	return {
		sourceFile,
		linePos: linePos.line + 1,
		relativePath,
	};
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
