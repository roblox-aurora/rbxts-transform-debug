import { CallMacro } from "../macro";
import { AssertMacro } from "./assert";
import { CompileTimeMacro } from "./compileTime";
import { DebugMacro } from "./dbg";
import { GitMacro } from "./git";
import { KeysOfMacro } from "./keyof";
import { ErrorMacro, PrintMacro, WarnMacro } from "./logging";
import { NameOfMacro } from "./nameof";

export const CALL_MACROS = new Array<CallMacro>(
	DebugMacro,
	GitMacro,
	CompileTimeMacro,
	PrintMacro,
	WarnMacro,
	ErrorMacro,
	NameOfMacro,
	AssertMacro,
	KeysOfMacro,
);
