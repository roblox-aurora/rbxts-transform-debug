import {$dbg} from "../../..";
export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 20;
$dbg(10 > 20);
$dbg(x);
print($dbg(makeHello("Vorlias")))