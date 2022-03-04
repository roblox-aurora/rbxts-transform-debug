import ts, { factory } from "typescript";

export function transformTime(expression: ts.CallExpression): ts.Expression {
	let typeName = "UnixTimestamp";

	const [kindName] = expression.arguments;
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
}
