import { $compileTime, $dbg, $git, $nameof, $print, $warn } from "../../..";

export function makeHello(name: string) {
	return (`Hello from ${name}!`);
}

$dbg("tet");
$git();
$compileTime();
$compileTime("ISO-8601");
$git("Branch", "Commit");
$print("hi there");
$warn("hi there again");

interface TestInterface {
	name: string;
}

$nameof<TestInterface>();