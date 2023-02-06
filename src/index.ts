/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import ts from "typescript";
import fs from "fs";
import { TransformConfiguration, TransformState } from "./class/transformState";
import { transformFile } from "./transform/transformFile";
import { LoggerProvider } from "./class/logProvider";

const DEFAULTS: TransformConfiguration = {
	enabled: true,
};

export default function transform(program: ts.Program, userConfiguration: TransformConfiguration) {
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

	const logger = new LoggerProvider(userConfiguration.verbose!, userConfiguration.verbose!);

	if (logger.verbose) {
		logger.write("\n");
	}

	logger.infoIfVerbose(userConfiguration.enabled ? "Enabling debug macro emit" : "Skipping over debug macro emit");

	const printer = ts.createPrinter({});

	return (context: ts.TransformationContext): ((file: ts.SourceFile) => ts.Node) => {
		const state = new TransformState(program, context, userConfiguration, logger);

		if (state.symbolProvider.moduleFile === undefined) {
			return (file) => file;
		}

		return (file: ts.SourceFile) => {
			const result = transformFile(state, file);

			if (process.env.EMIT_OUTPUT) {
				fs.writeFileSync(file.fileName.replace(/\.(ts)$/gm, ".ts-output"), printer.printFile(result));
			}

			return result;
		};
	};
}
