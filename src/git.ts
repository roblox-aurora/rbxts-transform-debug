import { execSync } from "child_process";
import execa from "execa";
import ts, { factory, PropertyAssignment } from "typescript";
import { formatTransformerDiagnostic } from "./shared";

let commit: string | undefined;
let branch: string | undefined;
let tag: string | undefined;
let dateString: string | undefined;
let unixTimestamp: number | undefined;

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

export function stringArgsToSet<K extends string = string>(
	expressions: readonly ts.Expression[],
	constraints?: ReadonlyArray<K>,
): ReadonlySet<K> {
	const set = new Set<K>();
	for (const value of expressions) {
		if (ts.isStringLiteral(value) && (constraints === undefined || constraints.includes(value.text as K))) {
			set.add(value.text as K);
		}
	}
	return set;
}

type ValueOf<T> = T[keyof T];
const keys = ["Commit", "Branch", "CommitHash", "LatestTag", "ISODate", "Timestamp"] as const;

export function transformGit(expression: ts.CallExpression): ts.AsExpression {
	let toInclude: ReadonlySet<ValueOf<typeof keys>> = new Set(keys);

	const args = expression.arguments;
	if (args.length > 0) {
		toInclude = stringArgsToSet(args, keys);
	}

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

	if (dateString === undefined) {
		try {
			const { stdout } = execa.commandSync("git show -s --format=%ct");
			dateString = new Date(parseInt(stdout) * 1000).toISOString();
			unixTimestamp = parseInt(stdout);
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

	const properties = new Array<PropertyAssignment>();

	if (toInclude.has("Branch")) {
		properties.push(factory.createPropertyAssignment("Branch", factory.createStringLiteral(branch)));
	}

	if (toInclude.has("Commit")) {
		properties.push(factory.createPropertyAssignment("Commit", factory.createStringLiteral(commit.substr(0, 7))));
	}

	if (toInclude.has("CommitHash")) {
		properties.push(factory.createPropertyAssignment("CommitHash", factory.createStringLiteral(commit)));
	}

	if (toInclude.has("LatestTag")) {
		properties.push(factory.createPropertyAssignment("LatestTag", factory.createStringLiteral(tag)));
	}

	if (toInclude.has("ISODate")) {
		properties.push(
			factory.createPropertyAssignment(
				"ISODate",
				factory.createStringLiteral(dateString ?? new Date().toISOString()),
			),
		);
	}

	if (toInclude.has("Timestamp")) {
		properties.push(
			factory.createPropertyAssignment("Timestamp", factory.createNumericLiteral(unixTimestamp ?? 0)),
		);
	}

	return factory.createAsExpression(
		factory.createObjectLiteralExpression(properties),
		factory.createTypeReferenceNode("$git"),
	);
}
