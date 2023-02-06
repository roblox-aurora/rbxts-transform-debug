import { CallMacro } from "../macro";
import { CompileTimeMacro } from "./compileTime";
import { DebugMacro } from "./dbg";
import { GitMacro } from "./git";
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
);
