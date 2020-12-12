import {$dbg} from "../../..";
export function makeHello(name: string) {
	$dbg(name);
	return $dbg(`Hello from ${name}!`);
}

$dbg("test");
$dbg(makeHello("Johnson"))

const test = $dbg("Hello");

const test2 = [$dbg("Worldie")];

{
	$dbg("Test");
}