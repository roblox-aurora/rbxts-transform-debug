# rbxts-transform-debug
A debugging transformer for roblox-ts, based on rust's [dbg!](https://doc.rust-lang.org/edition-guide/rust-next/dbg-macro.html) macro.

## How it works

Say we have this example code:
```ts
import { $dbg } from "rbxts-transform-debug";

function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 42;
$dbg(10 > 20);
$dbg(x);
print(makeHello("Vorlias"))
```

The emit would be:
```lua
local function makeHello(name)
	return (function(value)
		print("[src/shared/module.ts:2] `Hello from ${name}!` =", value)
		return value
	end)("Hello from " .. name .. "!")
end
local x = 42
print("[src/shared/module.ts:6] 10 > 20 =", 10 > 20)
print("[src/shared/module.ts:7] x =", x)
print(makeHello("Vorlias"))
```

If this code was ran, our output would give:
```
[src/shared/module.ts:2] `Hello from ${name}!` = Hello from Vorlias!
[src/shared/module.ts:6] 10 > 20 = false
[src/shared/module.ts:7] x = 42
Hello from Vorlias!
```
