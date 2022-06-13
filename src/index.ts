/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import ts from "typescript";
import fs from "fs";
import { formatTransformerDebug } from "./util/shared";
import chalk from "chalk";
import { TransformConfiguration, TransformState } from "./class/transformState";
import { transformFile } from "./transform/transformFile";

const DEFAULTS: TransformConfiguration = {
	enabled: true,
};

export default function transform(program: ts.Program, userConfiguration: TransformConfiguration) {
	const printer = ts.createPrinter();

	userConfiguration = { ...DEFAULTS, ...userConfiguration };
	if (userConfiguration.environmentRequires) {
		for (const [k, v] of Object.entries(userConfiguration.environmentRequires)) {
			if (
				(typeof v === "boolean" && process.env[k] === undefined) ||
				(typeof v === "string" && process.env[k] !== v)
			) {
				userConfiguration.enabled = false;
			}
		}
	}

	if (process.argv.includes("--verbose")) {
		userConfiguration.verbose = true;
	}

	if (userConfiguration.verbose) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		console.log(formatTransformerDebug("Running version " + require("../package.json").version));
		console.log(formatTransformerDebug(`Macros enabled: ${chalk.cyan(userConfiguration.enabled)}`));
	}

	return (context: ts.TransformationContext): ((file: ts.SourceFile) => ts.Node) => {
		const SHOULD_DEBUG_PROFILE = process.env.DEBUG_PROFILE;
		const SHOULD_DEBUG_EMIT = process.env.DEBUG_OUTPUT;
		const state = new TransformState(program, context, userConfiguration);

		return (file: ts.SourceFile) => {
			const label = `$debug:${file.fileName}`;

			if (SHOULD_DEBUG_PROFILE !== undefined) {
				console.count("$debug:transformations");
				console.time(label);
			}

			const result = transformFile(state, file);

			if (SHOULD_DEBUG_PROFILE !== undefined) console.timeEnd(label);

			if (SHOULD_DEBUG_EMIT !== undefined) {
				fs.writeFileSync(file.fileName.replace(/\.(ts)$/gm, ".ts-output"), printer.printFile(result));
			}

			return result;
		};
	};
}
