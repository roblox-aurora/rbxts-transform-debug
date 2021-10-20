import { execSync } from "child_process";
import execa from "execa";
import ts, { factory } from "typescript";
import { formatTransformerDiagnostic } from "./shared";

let commit: string | undefined;
let branch: string | undefined;
let tag: string | undefined;

export function transformCommitId(expression: ts.CallExpression): ts.StringLiteral {
	const [argument] = expression.arguments;

	if (commit === undefined) {
		try {
			commit = execSync("git rev-parse HEAD").toString().replace("\n", "");
		} catch (err) {
			throw formatTransformerDiagnostic(
				"Failed to grab git commit hash. Git not in PATH or project is not using git.",
				expression,
				err as string,
			);
		}
	}

	if (argument && argument.kind === ts.SyntaxKind.TrueKeyword) {
		return factory.createStringLiteral(commit);
	} else {
		return factory.createStringLiteral(commit.substr(0, 7));
	}
}

export function transformGit(expression: ts.CallExpression): ts.AsExpression {
	if (branch === undefined) {
		try {
			({ stdout: branch } = execa.commandSync("git rev-parse --abbrev-ref HEAD"));
		} catch (err) {
			throw formatTransformerDiagnostic(
				"Failed to grab git info. Git not in PATH or project is not using git.",
				expression,
				err as string,
			);
		}
	}

	if (commit === undefined) {
		try {
			({ stdout: commit } = execa.commandSync("git rev-parse HEAD"));
		} catch (err) {
			throw formatTransformerDiagnostic(
				"Failed to grab git info. Git not in PATH or project is not using git.",
				expression,
				err as string,
			);
		}
	}

	if (tag === undefined) {
		try {
			({ stdout: tag } = execa.commandSync("git describe --abbrev=0 --tags"));
		} catch (err) {
			tag = "";
		}
	}

	const properties = [
		factory.createPropertyAssignment("Branch", factory.createStringLiteral(branch)),
		factory.createPropertyAssignment("Commit", factory.createStringLiteral(commit.substr(0, 7))),
		factory.createPropertyAssignment("CommitHash", factory.createStringLiteral(commit)),
		factory.createPropertyAssignment("LatestTag", factory.createStringLiteral(tag ?? "")),
	];

	return factory.createAsExpression(
		factory.createObjectLiteralExpression(properties),
		factory.createTypeReferenceNode("$git"),
	);
}
