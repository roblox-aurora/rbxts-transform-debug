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

/**
 * Macro that gets replaced with the git commit hash. If the `full` argument is `true`,
 * this will be the full hash, otherwise it will be a 7 character hash.
 * @param full Whether or not to render the full commit hash
 */
export function $commitId(full?: true): string;
