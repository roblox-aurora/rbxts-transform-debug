import ts, { factory, ObjectLiteralElementLike, PropertyAssignment } from "typescript";
import { formatTransformerDiagnostic } from "./shared";

export function toExpression(value: unknown, name: string): ts.Expression | undefined {
	if (typeof value === "boolean") {
		return value ? factory.createTrue() : factory.createFalse();
	} else if (typeof value === "number") {
		return factory.createNumericLiteral(value);
	} else if (typeof value === "string") {
		return factory.createStringLiteral(value);
	} else if (typeof value === "object" && value !== null) {
		if (Array.isArray(value)) {
			// TODO: Generate array!
		} else {
			// TODO: Generate object!
			const literalElements = new Array<PropertyAssignment>();

			for (const [k, v] of Object.entries(value)) {
				const expression = toExpression(v, k);
				if (expression !== undefined) {
					literalElements.push(factory.createPropertyAssignment(factory.createStringLiteral(k), expression));
				}
			}

			return factory.createObjectLiteralExpression(literalElements, true);
		}
	} else if (value === undefined) {
		// throw formatTransformerDiagnostic(`Could not find value '${name}'`);
		return factory.createIdentifier("undefined");
	} else {
		throw `Unsupported in AST: ${typeof value}`;
	}
}
