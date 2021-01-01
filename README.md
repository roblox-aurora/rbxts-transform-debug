# rbxts-transform-debug
A debugging transformer for roblox-ts. Contains helper functions for debugging roblox-ts code with debug information attached.

## How it works

Say we have this example code:
```ts
import { $dbg, $print } from "rbxts-transform-debug";

export function makeHello(name: string) {
	return $dbg(`Hello from ${name}!`);
}

const x = 42;
$dbg(10 > 20);
$dbg(x);
$print(makeHello("Vorlias"))
```

The emit would be:
```lua
local function makeHello(name)
	return (function(value)
		print("[src/shared/module.ts:4] `Hello from ${name}!` =", value)
		return value
	end)("Hello from " .. name .. "!")
end
local x = 42
print("[src/shared/module.ts:8] 10 > 20 =", 10 > 20)
print("[src/shared/module.ts:9] x =", x)
print("[src/shared/module.ts:10]", makeHello("Vorlias"))
```

If this code was ran, our output would give:
```
[src/shared/module.ts:8] 10 > 20 = false
[src/shared/module.ts:9] x = 42
[src/shared/module.ts:2] `Hello from ${name}!` = Hello from Vorlias!
[src/shared/module.ts:10] Hello from Vorlias!
```

# Macros
## `$dbg`
Based on rust's [dbg!](https://doc.rust-lang.org/edition-guide/rust-next/dbg-macro.html) macro.

Will print out the expression + it's value prefixed by a file name + line number. If it is a complex expression (e.g. a right hand side expression) this will be done via an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), otherwise a regular print statement.

Simple:
```ts
const x = 10;
$dbg(x);
```
```lua
print("[source.ts:2] x =", 10)
```

IIFE:
```ts
function test() {
	return 10;
}
const value = $dbg(test());
```
```lua
local function test() 
	return 10
end
local value = (function(value)
	print("[source.ts:4] test() =", value)
	return value
end)(test())
```
## `$print`
Same as `print`, but will prefix the print with the file name + line number. Also controlled by the below settings as to whether or not it's emitted.

```ts
$print("Hello, World!");
```
```lua
print("[source.ts:1]", "Hello, World!");
```
## `$warn`
Same as `warn`, but will prefix the warning with the file name + line number. Also controlled by the below settings. Also controlled by the below settings as to whether or not it's emitted.

```ts
$warn("Hello, World!");
```
```lua
warn("[source.ts:1]", "Hello, World!");
```
# Configuration

## `environmentRequires` [Object]
An object of environment variable names mapped to either the required value, or `true` (if you want to only chekc that it's set)

The purpose of this is to conditionally render the `$dbg` calls as the debug statements _only_ if environment variables match your set conditions.

## `enabled` [Boolean] (Defaults to `true`)
Whether or not this transformer actually emits the `$dbg` as debug statements at all. If `false`, it will just return the expressions themselves.
