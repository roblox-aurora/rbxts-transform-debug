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

type $DefaultIfVoid<TVoidable, TDefault> = TVoidable extends void ? TDefault : TVoidable;

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
export function $dbg<T>(expression: T, customHandler: (value: Readonly<T>, debug: $DebugInfo) => T | void): T;
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
