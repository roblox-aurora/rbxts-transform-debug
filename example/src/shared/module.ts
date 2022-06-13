import { $compileTime, $dbg, $file, $git, $nameof, $package, $print, $warn } from "../../..";

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