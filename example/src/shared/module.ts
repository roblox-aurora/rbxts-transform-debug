import { $compileTime, $dbg, $git, $nameof, $package, $print, $warn } from "../../..";

export function makeHello(name: string) {
	return (`Hello from ${name}!`);
}

// $package.name;

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


$package.version
$print($package.devDependencies);
$dbg($dbg("hi"));