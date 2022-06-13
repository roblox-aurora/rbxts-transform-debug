import ts, { factory } from "typescript";
import { TransformState } from "../../../class/transformState";
import { CallMacro } from "../macro";

export const CompileTimeMacro: CallMacro = {
	getSymbol(state: TransformState) {
		return state.symbolProvider.moduleFile?.get("$compileTime");
	},
	transform(state: TransformState, node: ts.CallExpression) {
		let typeName = "UnixTimestamp";

		const [kindName] = node.arguments;
		if (kindName !== undefined && ts.isStringLiteral(kindName)) {
			typeName = kindName.text;
		}

		switch (typeName) {
			case "DateTime":
				return factory.createNonNullExpression(
					factory.createCallExpression(
						factory.createPropertyAccessExpression(factory.createIdentifier("DateTime"), "fromIsoDate"),
						undefined,
						[factory.createStringLiteral(new Date().toISOString())],
					),
				);
			case "UnixTimestamp":
				return factory.createNumericLiteral(Math.floor(new Date().valueOf() / 1000));
			case "UnixTimestampMillis":
				return factory.createNumericLiteral(new Date().valueOf());
			case "ISO-8601":
				return factory.createStringLiteral(new Date().toISOString());
			default:
				throw `Invalid input`;
		}
	},
};
