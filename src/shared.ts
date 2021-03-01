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

export function formatTransformerDebug(message: string, node?: ts.Node): string {
	if (node) {
		const info = getDebugInfo(node);
		const str = `${chalk.gray("[rbxts-transform-debug]")} ${chalk.green("macro debug")} ${chalk.cyan(
			info.relativePath,
		)}:${chalk.yellow(info.linePos)} - ${message}\n${chalk.italic(node.getText())}`;
		return str;
	} else {
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.green("macro debug")} - ` + message;
	}
}

export function formatTransformerInfo(message: string, node?: ts.Node): string {
	if (node) {
		const str = `${chalk.gray("[rbxts-transform-debug]")} ${chalk.cyan("macro info")} - ${message}\n${chalk.italic(
			node.getText(),
		)}`;
		return str;
	} else {
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.cyan("macro info")} ` + message;
	}
}

export function formatTransformerWarning(message: string, node?: ts.Node, suggestion?: string): string {
	if (node) {
		const info = getDebugInfo(node);
		let str = `${chalk.gray("[rbxts-transform-debug]")} ${chalk.yellow("macro warning")} ${chalk.cyan(
			info.relativePath,
		)}:${chalk.yellow(info.linePos)} - ${message}\n${chalk.italic(node.getText())}`;

		if (suggestion) {
			str += "\n* " + chalk.yellow(suggestion);
		}

		return str;
	} else {
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.yellow("macro warning")} - ` + message;
	}
}

export function formatTransformerDiagnostic(message: string, node?: ts.Node, suggestion?: string): string {
	if (node) {
		const info = getDebugInfo(node);
		let str = `${chalk.gray("[rbxts-transform-debug]")} ${chalk.red("macro error")} ${chalk.cyan(
			info.relativePath,
		)}:${chalk.yellow(info.linePos)} - ${message}\n${chalk.italic(node.getText())}`;

		if (suggestion) {
			str += "\n* " + chalk.yellow(suggestion);
		}

		return str;
	} else {
		return `${chalk.gray("[rbxts-transform-debug]")} ${chalk.red("macro error")} - ` + message;
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
