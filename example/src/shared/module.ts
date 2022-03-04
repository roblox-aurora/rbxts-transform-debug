import {$dbg, $nameof, $print, $warn, $git, $compileTime} from "../../..";
import type {$DebugInfo} from "../../..";

export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 42;
$dbg(10 > 20);
$dbg(x);
interface Testing {

}
class Testing2 {

}
type Testing3 = {};
const testing = $nameof<Testing>();
const testing2 = $nameof<Testing2>();
const testing3 = $nameof<Testing3>();

function exampleFunction(input: string) {
	$print("Call to exampleFunction");
	$nameof(exampleFunction);
	const value = `${$nameof(input)}`
	$dbg(input, (value, source) => {
		// should print something like [module.ts:13] exampleFunction(input:string = value)
		print(`[${
			source.file
		}:${
			source.lineNumber
		}] ${$nameof(exampleFunction)}(${
			source.rawText
		} = ${ 
			value
		})`);
	})
}

// [module.ts:13] exampleFunction(input = Hello, World!)
exampleFunction("Hello, World!");

const git = $git();
const dateStuff = $git("ISODate", "Timestamp")
$compileTime()
$compileTime("DateTime")
$compileTime("ISO-8601")
$compileTime("UnixTimestampMillis")
$compileTime("UnixTimestamp")