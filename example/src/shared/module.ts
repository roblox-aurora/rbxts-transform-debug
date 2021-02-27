import {$dbg, $print, $warn} from "../../..";
import type {$DebugInfo} from "../../..";

export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 42;
$dbg(10 > 20);
$dbg(x);

const testDebug = {
	callback(value: unknown, debug: $DebugInfo) {
	}
}
$dbg([1, 2, 3], (value, source) => {
	print(`[${source.file}:${source.lineNumber}] ${source.rawText}`);
});

const value = $dbg(10 > 20, (value) => value);

$dbg(x, testDebug.callback);
$print(makeHello("Vorlias"))