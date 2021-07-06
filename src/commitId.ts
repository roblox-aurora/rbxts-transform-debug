import { execSync } from "child_process";
import ts, { factory } from "typescript";
import { formatTransformerDiagnostic } from "./shared";

let commit: string | undefined;

export function transformCommitId(expression: ts.CallExpression): ts.StringLiteral {
	const [argument] = expression.arguments;

	if (commit === undefined) {
		try {
			commit = execSync("git rev-parse HEAD").toString().replace("\n", "");
		} catch (err) {
			throw formatTransformerDiagnostic(
				"Failed to grab git commit hash. Git not in PATH or project is not using git.",
				expression,
				err,
			);
		}
	}

	if (argument && argument.kind === ts.SyntaxKind.TrueKeyword) {
		return factory.createStringLiteral(commit);
	} else {
		return factory.createStringLiteral(commit.substr(0, 7));
	}
}
