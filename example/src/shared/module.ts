import { $assert, $compileTime, $dbg, $keysof, $nameof } from "../../..";

const compileTime = $compileTime("DateTime");

const x = "no lol";
$assert(typeIs(x, "number"));

interface Test {}
const testKeys = $keysof<Test>();

const keys = $keysof({ a: 1, b: 2, c: 3 });

class Test {
	public method() {
		$nameof(this);
	}

	public static staticMethod() {
		$nameof(Test);
	}

	public methodWithParameter(parameter: string) {
		$nameof(parameter);
	}
}
