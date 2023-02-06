import chalk from "chalk";
const TRANSFORMER_NAME = "Debug";

export class LoggerProvider {
	public constructor(public readonly debug: boolean, public readonly verbose: boolean) {
		// NOTHING YET
	}

	public write(message: string): void {
		process.stdout.write(message);
	}

	public writeLine(...messages: ReadonlyArray<unknown>): void {
		if (!this.debug) return;

		for (const message of messages) {
			const text = typeof message === "string" ? `${message}` : `${JSON.stringify(message, undefined, "\t")}`;

			const prefix = `[${chalk.gray(TRANSFORMER_NAME)}]: `;
			this.write(`${prefix}${text.replace(/\n/g, `\n${prefix}`)}\n`);
		}
	}

	public writeLineIfVerbose(...messages: Array<unknown>): void {
		if (this.verbose) return this.writeLine(...messages);
	}

	public info(...messages: Array<unknown>): void {
		this.writeLine(...messages.map((x) => chalk.blue(x)));
	}

	public infoIfVerbose(...messages: Array<unknown>): void {
		if (this.verbose) return this.info(...messages);
	}

	public warn(...messages: Array<unknown>): void {
		this.writeLine(...messages.map((x) => chalk.yellow(x)));
	}

	public warnIfVerbose(...messages: Array<unknown>): void {
		if (this.verbose) return this.warn(...messages);
	}

	public error(...messages: Array<unknown>): void {
		this.writeLine(...messages.map((x) => chalk.red(x)));
	}
}
