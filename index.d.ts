import { PackageJson } from "types-package-json";

/**
 * The debug information in a `$dbg` custom call
 *
 * If you're referencing this in your code, import it as:
 * ```ts
 * import type { $DebugInfo } from "rbxts-transform-debug";
 * ```
 * to get around the import stripping
 */
export interface DbgExpressionInfo {
	/**
	 * The current file of this expression
	 */
	readonly file: string;
	/**
	 * The line number where the expression is
	 */
	readonly lineNumber: number;
	/**
	 * The raw text of the expression
	 */
	readonly rawText: string;

	/**
	 * Whether or not the expression is a LuaTuple
	 */
	readonly isLuaTuple: boolean;
}

/** @deprecated */
export type $DebugInfo = DbgExpressionInfo;

export interface FileInfo {
	/**
	 * The current file's path
	 */
	readonly filePath: string;
	/**
	 * The line number of this expression
	 */
	readonly lineNumber: number;
}

export interface PackageJsonInfo extends Readonly<PackageJson> {
	readonly [value: string]: unknown;
}

/**
 * Contains properties in your `package.json` such as `$package.version` being the version.
 */
export declare const $package: PackageJsonInfo;

/**
 * Contains information about the current file
 *
 * - `lineNumber` - will use the current line number of the macro
 * - `filePath` - will be the relative path of your file, relative to the root directory
 */
export declare const $file: FileInfo;

/**
 * Creates a debug print for the supplied expression
 *
 * The expression will only be wrapped with the debug information if `enabled` (true by default) is set
 * or `environmentRequires` is fulfilled.
 *
 * @param expression The expression to make a debug statement of
 * @param customHandler A custom IIFE handler for debugging this expression
 */
export function $dbg<T>(expression: T): T;
export function $dbg<T>(expression: T, customHandler: (value: Readonly<T>, debug: DbgExpressionInfo) => void): T;
/**
 * Same as `print`, but includes the source information
 * Will be prefixed with something like `[src/shared/module.ts:11]`
 *
 * This can be optionally enabled/disabled in emit using `enabled` and `environmentRequires`.
 */
export function $print(...params: unknown[]): void;

/**
 * Same as `warn`, but includes the source information
 * Will be prefixed with something like `[src/shared/module.ts:11]`
 *
 * This can be optionally enabled/disabled in emit using `enabled` and `environmentRequires`.
 */
export function $warn(...params: unknown[]): void;

/**
 * Same as `error`, but includes the source information
 * Will be prefixed with something like `[src/shared/module.ts:11]`
 *
 * This can be optionally enabled/disabled in emit using `enabled` and `environmentRequires`.
 */
export function $error(message: string, level?: number): never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * A macro that gets replaced with the specified type or value
 * @param T An interface, type or class type
 * @param value A value of which to get the name for
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function $nameof<T>(): string;
export function $nameof(value: unknown): string;

export interface $git {
	/**
	 * The name of the branch this project is on
	 */
	readonly Branch: string;
	/**
	 * The current short commit hash (7 characters)
	 */
	readonly Commit: string;
	/**
	 * The current full commit hash
	 */
	readonly CommitHash: string;
	/**
	 * The latest tag this project has (will be an empty string, if no tags have ever been applied)
	 */
	readonly LatestTag: string;

	/**
	 * The ISO-formatted date time of the current commit
	 */
	readonly ISODate: string;

	/**
	 * The unix timestamp of this commit
	 */
	readonly Timestamp: number;
}

type $GitProps<K extends keyof $git> = Pick<$git, K>;

/**
 * Macro that returns an object containing all the git information
 */
export function $git(): $git;

/**
 * Macro that returns an object containing specified git properties
 * @param props The properties to filter out
 */
export function $git<K extends keyof $git>(...props: K[]): $GitProps<K>;

interface CompileTimeKind {
	DateTime: DateTime;
	UnixTimestamp: number;
	UnixTimestampMillis: number;
	["ISO-8601"]: string;
}

/**
 * Returns the unix timestamp of the time the code was compiled
 */
export function $compileTime(): number;
/**
 * Returns an expression of the compile time based on the output kind
 * @param outputAs The kind of expression to output representing the compile time
 */
export function $compileTime<TKind extends keyof CompileTimeKind>(outputAs: TKind): CompileTimeKind[TKind];
