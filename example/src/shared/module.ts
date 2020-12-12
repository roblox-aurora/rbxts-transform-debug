import { $dbg } from "../../..";
export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

print(makeHello("hi!"));