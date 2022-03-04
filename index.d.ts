/**
 * The debug information in a `$dbg` custom call
 *
 * If you're referencing this in your code, import it as:
 * ```ts
 * import type { $DebugInfo } from "rbxts-transform-debug";
 * ```
 * to get around the import stripping
 */
export interface $DebugInfo {
	file: string;
	lineNumber: number;
	rawText: string;
}

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
export function $dbg<T>(expression: T, customHandler: (value: Readonly<T>, debug: $DebugInfo) => void): T;
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
