import ts, { factory, PropertyAssignment } from "typescript";
import { TransformState } from "../../../class/transformState";
import { CallMacro, MacroInfo } from "../macro";

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

export function transformGit(state: TransformState, expression: ts.CallExpression): ts.AsExpression {
	let toInclude: ReadonlySet<ValueOf<typeof keys>> = new Set(keys);

	const git = state.gitProvider;

	const args = expression.arguments;
	if (args.length > 0) {
		toInclude = stringArgsToSet(args, keys);
	}

	const properties = new Array<PropertyAssignment>();

	if (toInclude.has("Branch")) {
		properties.push(factory.createPropertyAssignment("Branch", factory.createStringLiteral(git.query("branch"))));
	}

	if (toInclude.has("Commit")) {
		properties.push(
			factory.createPropertyAssignment(
				"Commit",
				factory.createStringLiteral(git.query("commit").substring(0, 7)),
			),
		);
	}

	if (toInclude.has("CommitHash")) {
		properties.push(
			factory.createPropertyAssignment("CommitHash", factory.createStringLiteral(git.query("commit"))),
		);
	}

	if (toInclude.has("LatestTag")) {
		properties.push(
			factory.createPropertyAssignment("LatestTag", factory.createStringLiteral(git.query("latestTag"))),
		);
	}

	if (toInclude.has("ISODate")) {
		const dateString = git.query("isoTimestamp");

		properties.push(
			factory.createPropertyAssignment(
				"ISODate",
				factory.createStringLiteral(dateString ?? new Date().toISOString()),
			),
		);
	}

	if (toInclude.has("Timestamp")) {
		const unixTimestamp = git.query("unixTimestamp");

		properties.push(factory.createPropertyAssignment("Timestamp", factory.createNumericLiteral(unixTimestamp)));
	}

	return factory.createAsExpression(
		factory.createObjectLiteralExpression(properties),
		factory.createTypeReferenceNode("$git"),
	);
}

export const GitMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile!.get("$git");
	},
	transform(state: TransformState, node: ts.CallExpression, { symbol }: MacroInfo) {
		return transformGit(state, node);
	},
};
