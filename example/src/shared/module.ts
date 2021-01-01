import {$dbg, $print, $warn} from "../../..";

export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 42;
$dbg(10 > 20);
$dbg(x);
$print(makeHello("Vorlias"))