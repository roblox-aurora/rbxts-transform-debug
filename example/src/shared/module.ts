import { $compileTime, $dbg, $DebugInfo, $file, $git, $nameof, $package, $print, $warn } from "../../..";
import { test } from "./someOtherFile";

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


$print($package.name, "is version", $package.version, "with a description of", $package.description);

for (const [depName, depVersion] of pairs($package.dependencies)) {
	$print($package.name, "dependency", depName, depVersion);
}

for (const [depName, depVersion] of pairs($package.devDependencies)) {
	$print($package.name, "devDependency", depName, depVersion);
}

const versionOfCompilerTypes = $package.devDependencies?.["@rbxts/compiler-types"];
$print(versionOfCompilerTypes);
$print($file.lineNumber, $file.filePath);
$compileTime();

const anotherTest = $package.repository;
$print($package.customField)


function test2() {
	const handler = (value: string, debugInfo: $DebugInfo) => {}

	$dbg("hi there", handler);

	const test3 = $dbg({value: test()}, () => {
		print("hi!");
	})
}