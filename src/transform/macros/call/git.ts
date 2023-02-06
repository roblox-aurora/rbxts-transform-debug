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

export function transformGit(state: TransformState, expression: ts.CallExpression): ts.Expression {
	let toInclude: ReadonlySet<string> = new Set(keys);

	const git = state.gitProvider;

	const args = expression.arguments;
	if (args.length > 0) {
		toInclude = stringArgsToSet(args, keys);
	} else {
		// "optimizations"

		// If we're part of a direct prop access, we can reduce to that.
		if (ts.isPropertyAccessExpression(expression.parent)) {
			toInclude = new Set([expression.parent.name.text]);
		}
		// else if (ts.isVariableDeclaration(expression.parent)) {
		// 	// Slim down if using object bindings
		// 	const binding = expression.parent.parent;
		// 	if (ts.isVariableDeclarationList(binding) && binding.declarations.length === 1) {
		// 		const [first] = binding.declarations;
		// 		if (ts.isObjectBindingPattern(first.name)) {
		// 			toInclude.clear();
		// 			for (const binding of first.name.elements) {
		// 				toInclude.add(binding.name.getText());
		// 			}
		// 		}
		// 	}
		// }
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
